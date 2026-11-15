ALTER TABLE "orders"
    DROP COLUMN IF EXISTS "checkout_url",
    DROP COLUMN IF EXISTS "transaction_nsu",
    DROP COLUMN IF EXISTS "invoice_slug",
    DROP COLUMN IF EXISTS "capture_method";

DROP TABLE IF EXISTS "order_webhook_events";
