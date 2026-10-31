-- Align the atomic callback RPC with the current Duitku POP callback contract.
-- Duitku POP HTTP callback resultCode: 00 = success, 01 = failed. Asri does not use Credit Card/Capture.

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
