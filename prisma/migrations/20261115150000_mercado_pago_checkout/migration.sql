ALTER TABLE "orders"
ADD COLUMN "mercado_pago_order_id" VARCHAR(100),
ADD COLUMN "mercado_pago_payment_id" VARCHAR(100),
ADD COLUMN "mercado_pago_status" VARCHAR(80),
ADD COLUMN "mercado_pago_status_detail" VARCHAR(120),
ADD COLUMN "pix_qr_code" TEXT,
ADD COLUMN "pix_qr_code_base64" TEXT,
ADD COLUMN "pix_ticket_url" TEXT,
ADD COLUMN "payment_expires_at" TIMESTAMPTZ(6);

CREATE UNIQUE INDEX "orders_mercado_pago_order_id_key"
ON "orders"("mercado_pago_order_id");

CREATE INDEX "orders_mercado_pago_status_idx"
ON "orders"("mercado_pago_status");

UPDATE "payment_methods"
SET "active" = false
WHERE LOWER("name") = 'dinheiro';
