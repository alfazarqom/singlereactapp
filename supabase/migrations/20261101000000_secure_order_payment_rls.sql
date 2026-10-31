-- Secure public access to order/payment data and make verified callback logs idempotent.
-- This migration is prepared for review only; it has NOT been applied to any database.

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Keep the repository's guest INSERT flow, but remove public access to customer order data
-- and prohibit browser-side payment/order updates.
DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update on orders" ON public.orders;
REVOKE SELECT, UPDATE, DELETE ON TABLE public.orders FROM anon, authenticated;

-- Payment audit events are written/read only by trusted server-side code (service role).
DROP POLICY IF EXISTS "Allow public insert on payment_logs" ON public.payment_logs;
DROP POLICY IF EXISTS "Allow public select on payment_logs" ON public.payment_logs;
REVOKE ALL ON TABLE public.payment_logs FROM anon, authenticated;

-- Do not delete or rewrite historical logs to force uniqueness. Stop safely if duplicates
-- already exist; resolve them through a separately reviewed data-reconciliation procedure.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.payment_logs
    WHERE event_type = 'CALLBACK_VERIFIED'
      AND merchant_order_id IS NOT NULL
      AND reference IS NOT NULL
    GROUP BY merchant_order_id, reference, event_type
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot add callback idempotency index: duplicate CALLBACK_VERIFIED rows already exist. Reconcile them before retrying.';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_logs_callback_idempotency
  ON public.payment_logs (merchant_order_id, reference, event_type)
  WHERE event_type = 'CALLBACK_VERIFIED'
    AND merchant_order_id IS NOT NULL
    AND reference IS NOT NULL;
