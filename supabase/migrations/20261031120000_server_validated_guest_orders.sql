-- Server-authoritative guest order creation and atomic Duitku callback handling.
-- Apply only after separate Supabase deployment approval.

create or replace function public.create_guest_order(
  p_merchant_order_id text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_price numeric;
  v_subtotal numeric := 0;
  v_shipping_fee constant numeric := 52000;
  v_items jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_total numeric;
begin
  if coalesce(trim(p_merchant_order_id), '') = ''
     or length(p_merchant_order_id) > 50
     or coalesce(trim(p_customer_name), '') = ''
     or coalesce(trim(p_customer_email), '') = ''
     or coalesce(trim(p_customer_phone), '') = ''
     or jsonb_typeof(p_shipping_address) <> 'object'
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1
     or jsonb_array_length(p_items) > 30 then
    raise exception 'Invalid order details' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'productId', '') !~* '^[0-9a-f-]{36}$'
       or coalesce(v_item->>'quantity', '') !~ '^[1-9][0-9]{0,2}$' then
      raise exception 'Invalid product or quantity' using errcode = '22023';
    end if;

    v_quantity := (v_item->>'quantity')::integer;
    select id, title, price, sale_price, availability, stock_quantity, image_url
      into v_product
      from public.apps_products
      where id = (v_item->>'productId')::uuid
      for update;

    if not found then
      raise exception 'Product not found' using errcode = 'P0002';
    end if;
    if lower(coalesce(v_product.availability, '')) not in ('available', 'in stock')
       or coalesce(v_product.stock_quantity, 0) < v_quantity then
      raise exception 'Product unavailable or insufficient stock: %', v_product.title using errcode = 'P0001';
    end if;

    v_price := coalesce(nullif(v_product.sale_price, 0), v_product.price);
    if v_price is null or v_price < 1 or v_price <> trunc(v_price) then
      raise exception 'Invalid product price' using errcode = '22023';
    end if;

    update public.apps_products
      set stock_quantity = coalesce(stock_quantity, 0) - v_quantity,
          updated_at = now()
      where id = v_product.id;

    v_subtotal := v_subtotal + (v_price * v_quantity);
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'product_id', v_product.id,
      'title', v_product.title,
      'price', v_price,
      'quantity', v_quantity,
      'variant', concat_ws(' / ', nullif(v_item->>'color', ''), nullif(v_item->>'size', '')),
      'thumbnail', v_product.image_url,
      'subtotal', v_price * v_quantity
    ));
  end loop;

  v_total := v_subtotal + v_shipping_fee;
  insert into public.orders (
    merchant_order_id, amount, shipping_fee, discount_amount, total_amount,
    product_details, customer_name, customer_email, customer_phone,
    shipping_address, status, created_at, updated_at
  ) values (
    p_merchant_order_id, v_subtotal, v_shipping_fee, 0, v_total,
    (select string_agg(value->>'title', ', ') from jsonb_array_elements(v_items)),
    trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    p_shipping_address, 'PENDING', now(), now()
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id, product_id, title, price, quantity, variant, thumbnail, subtotal
  )
  select
    v_order_id,
    (value->>'product_id')::uuid,
    value->>'title',
    (value->>'price')::numeric,
    (value->>'quantity')::integer,
    nullif(value->>'variant', ''),
    nullif(value->>'thumbnail', ''),
    (value->>'subtotal')::numeric
  from jsonb_array_elements(v_items);

  return jsonb_build_object(
    'order_id', v_order_id,
    'merchant_order_id', p_merchant_order_id,
    'subtotal', v_subtotal,
    'shipping_fee', v_shipping_fee,
    'amount', v_total,
    'items', v_items
  );
end;
$$;

-- Release stock only while the order is still pending. The status transition and
-- inventory restoration share one transaction, making repeated calls harmless.
create or replace function public.release_guest_order_inventory(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status text;
begin
  select status into v_status
    from public.orders
    where id = p_order_id
    for update;

  if not found or v_status <> 'PENDING' then
    return false;
  end if;

  update public.apps_products p
    set stock_quantity = coalesce(p.stock_quantity, 0) + x.quantity,
        updated_at = now()
    from (
      select product_id, sum(quantity)::integer as quantity
      from public.order_items
      where order_id = p_order_id and product_id is not null
      group by product_id
    ) x
    where p.id = x.product_id;

  update public.orders
    set status = 'FAILED', updated_at = now()
    where id = p_order_id and status = 'PENDING';

  return true;
end;
$$;

-- Keep a minimal durable record of verified callbacks and their processing outcome.
create table if not exists public.payment_callback_events (
  event_key text primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric not null,
  provider_reference text not null,
  result_code text not null,
  received_at timestamptz not null default now()
);
alter table public.payment_callback_events enable row level security;
revoke all on public.payment_callback_events from public, anon, authenticated;
grant all on public.payment_callback_events to service_role;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders
  add constraint orders_status_check
  check (status = any (array[
    'PENDING','SUCCESS','FAILED','CANCELLED','EXPIRED',
    'PROCESSING','SHIPPED','DELIVERED','PAYMENT_REVIEW'
  ]));

-- A single locked transaction validates the provider reference/amount, records
-- the callback, changes status, and releases inventory when a failure is final.
create or replace function public.apply_duitku_callback(
  p_event_key text,
  p_merchant_order_id text,
  p_amount numeric,
  p_reference text,
  p_result_code text,
  p_payment_code text default null,
  p_additional_param text default null
) returns text
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_order public.orders%rowtype;
  v_inserted integer;
begin
  if coalesce(p_event_key, '') !~ '^[0-9a-f]{64}$'
     or coalesce(p_merchant_order_id, '') = ''
     or p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount)
     or coalesce(p_reference, '') = ''
     or p_result_code not in ('00','01') then
    raise exception 'Invalid callback arguments' using errcode = '22023';
  end if;

  select * into v_order
    from public.orders
    where merchant_order_id = p_merchant_order_id
    for update;

  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;
  if v_order.total_amount <> p_amount then
    raise exception 'Callback amount mismatch' using errcode = '22023';
  end if;
  if coalesce(v_order.reference, '') = '' or v_order.reference <> p_reference then
    raise exception 'Callback reference mismatch' using errcode = '22023';
  end if;

  insert into public.payment_callback_events (
    event_key, order_id, amount, provider_reference, result_code
  ) values (
    p_event_key, v_order.id, p_amount, p_reference, p_result_code
  ) on conflict (event_key) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return 'DUPLICATE';
  end if;

  if v_order.status = 'PENDING' and p_result_code = '00' then
    update public.orders
      set status = 'SUCCESS',
          result_code = p_result_code,
          payment_method = p_payment_code,
          additional_param = p_additional_param,
          paid_at = now(),
          updated_at = now()
      where id = v_order.id;
    return 'SUCCESS';
  end if;

  if v_order.status = 'PENDING' and p_result_code = '01' then
    perform public.release_guest_order_inventory(v_order.id);
    update public.orders
      set result_code = p_result_code,
          payment_method = p_payment_code,
          additional_param = p_additional_param,
          updated_at = now()
      where id = v_order.id;
    return 'FAILED';
  end if;

  -- A late success after stock has been released (or after another terminal
  -- transition) must never silently reactivate the order or decrement stock.
  if p_result_code = '00' and v_order.status in ('FAILED','CANCELLED','EXPIRED') then
    update public.orders
      set status = 'PAYMENT_REVIEW',
          result_code = p_result_code,
          payment_method = p_payment_code,
          additional_param = p_additional_param,
          paid_at = now(),
          updated_at = now()
      where id = v_order.id;
    return 'PAYMENT_REVIEW';
  end if;

  return 'IGNORED_TERMINAL';
end;
$$;

revoke all on function public.create_guest_order(text,text,text,text,jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.release_guest_order_inventory(uuid) from public, anon, authenticated;
revoke all on function public.apply_duitku_callback(text,text,numeric,text,text,text,text) from public, anon, authenticated;
grant execute on function public.create_guest_order(text,text,text,text,jsonb,jsonb) to service_role;
grant execute on function public.release_guest_order_inventory(uuid) to service_role;
grant execute on function public.apply_duitku_callback(text,text,numeric,text,text,text,text) to service_role;

-- Basic per-IP abuse control for the public guest checkout endpoint.
create table if not exists public.guest_checkout_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1,
  updated_at timestamptz not null default now()
);
create index if not exists guest_checkout_rate_limits_updated_at_idx
  on public.guest_checkout_rate_limits(updated_at);
alter table public.guest_checkout_rate_limits enable row level security;
revoke all on public.guest_checkout_rate_limits from public, anon, authenticated;
grant all on public.guest_checkout_rate_limits to service_role;

create or replace function public.consume_guest_checkout_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_count integer;
begin
  if coalesce(length(p_ip_hash), 0) <> 64 then
    raise exception 'Invalid rate limit key' using errcode = '22023';
  end if;

  delete from public.guest_checkout_rate_limits
    where updated_at < now() - interval '1 day';

  insert into public.guest_checkout_rate_limits(ip_hash, window_started_at, request_count, updated_at)
  values (p_ip_hash, now(), 1, now())
  on conflict (ip_hash) do update
    set request_count = case
          when guest_checkout_rate_limits.window_started_at < now() - interval '15 minutes' then 1
          else guest_checkout_rate_limits.request_count + 1
        end,
        window_started_at = case
          when guest_checkout_rate_limits.window_started_at < now() - interval '15 minutes' then now()
          else guest_checkout_rate_limits.window_started_at
        end,
        updated_at = now()
  returning request_count into v_count;
  return v_count <= 5;
end;
$$;
revoke all on function public.consume_guest_checkout_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_guest_checkout_rate_limit(text) to service_role;
