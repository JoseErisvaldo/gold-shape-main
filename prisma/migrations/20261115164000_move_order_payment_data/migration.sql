CREATE TABLE "mercado_pago_payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "order_id" UUID NOT NULL,
  "payment_method_id" UUID,
  "cash_received" INTEGER,
  "mercado_pago_order_id" VARCHAR(100),
  "mercado_pago_payment_id" VARCHAR(100),
  "mercado_pago_payment_method_id" VARCHAR(80),
  "mercado_pago_payment_type" VARCHAR(40),
  "mercado_pago_installments" INTEGER,
  "mercado_pago_status" VARCHAR(80),
  "mercado_pago_status_detail" VARCHAR(120),
  "pix_qr_code" TEXT,
  "pix_qr_code_base64" TEXT,
  "pix_ticket_url" TEXT,
  "payment_expires_at" TIMESTAMPTZ(6),
  "paid_at" TIMESTAMPTZ(6),
  CONSTRAINT "mercado_pago_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "mercado_pago_payments_order_id_key"
ON "mercado_pago_payments"("order_id");

CREATE UNIQUE INDEX "mercado_pago_payments_mercado_pago_order_id_key"
ON "mercado_pago_payments"("mercado_pago_order_id");

CREATE INDEX "mercado_pago_payments_mercado_pago_status_idx"
ON "mercado_pago_payments"("mercado_pago_status");

ALTER TABLE "mercado_pago_payments"
ADD CONSTRAINT "mercado_pago_payments_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "mercado_pago_payments_payment_method_id_fkey"
  FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "mercado_pago_payments" (
  "order_id",
  "payment_method_id",
  "cash_received",
  "mercado_pago_order_id",
  "mercado_pago_payment_id",
  "mercado_pago_payment_method_id",
  "mercado_pago_payment_type",
  "mercado_pago_installments",
  "mercado_pago_status",
  "mercado_pago_status_detail",
  "pix_qr_code",
  "pix_qr_code_base64",
  "pix_ticket_url",
  "payment_expires_at",
  "paid_at"
)
SELECT
  "id",
  "payment_method_id",
  "cash_received",
  "mercado_pago_order_id",
  "mercado_pago_payment_id",
  "mercado_pago_payment_method_id",
  "mercado_pago_payment_type",
  "mercado_pago_installments",
  "mercado_pago_status",
  "mercado_pago_status_detail",
  "pix_qr_code",
  "pix_qr_code_base64",
  "pix_ticket_url",
  "payment_expires_at",
  "paid_at"
FROM "orders"
WHERE "payment_method_id" IS NOT NULL
   OR "cash_received" IS NOT NULL
   OR "mercado_pago_order_id" IS NOT NULL
   OR "mercado_pago_payment_id" IS NOT NULL
   OR "mercado_pago_payment_method_id" IS NOT NULL
   OR "mercado_pago_payment_type" IS NOT NULL
   OR "mercado_pago_installments" IS NOT NULL
   OR "mercado_pago_status" IS NOT NULL
   OR "mercado_pago_status_detail" IS NOT NULL
   OR "pix_qr_code" IS NOT NULL
   OR "pix_qr_code_base64" IS NOT NULL
   OR "pix_ticket_url" IS NOT NULL
   OR "payment_expires_at" IS NOT NULL
   OR "paid_at" IS NOT NULL;

DROP INDEX "orders_mercado_pago_order_id_key";
DROP INDEX "orders_mercado_pago_status_idx";

ALTER TABLE "orders"
DROP CONSTRAINT "orders_payment_method_id_fkey",
DROP COLUMN "payment_method_id",
DROP COLUMN "cash_received",
DROP COLUMN "mercado_pago_order_id",
DROP COLUMN "mercado_pago_payment_id",
DROP COLUMN "mercado_pago_payment_method_id",
DROP COLUMN "mercado_pago_payment_type",
DROP COLUMN "mercado_pago_installments",
DROP COLUMN "mercado_pago_status",
DROP COLUMN "mercado_pago_status_detail",
DROP COLUMN "pix_qr_code",
DROP COLUMN "pix_qr_code_base64",
DROP COLUMN "pix_ticket_url",
DROP COLUMN "payment_expires_at",
DROP COLUMN "paid_at";
