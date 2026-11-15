CREATE TYPE "order_status" AS ENUM (
    'PENDING',
    'PAID',
    'SETTLED',
    'CANCELED',
    'REFUNDED',
    'PAYMENT_FAILED'
);

CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "order_nsu" VARCHAR(100) NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "checkout_url" TEXT,
    "transaction_nsu" VARCHAR(100),
    "invoice_slug" VARCHAR(255),
    "capture_method" VARCHAR(40),
    "cep" VARCHAR(9),
    "street" VARCHAR(200) NOT NULL,
    "number" VARCHAR(30) NOT NULL,
    "neighborhood" VARCHAR(120) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "state" CHAR(2) NOT NULL,
    "complement" VARCHAR(120),
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "product_name" VARCHAR(180) NOT NULL,
    "variant_label" VARCHAR(180),
    "sku" VARCHAR(80) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_webhook_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "payload_hash" VARCHAR(64) NOT NULL,
    "event" VARCHAR(40) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "orders_order_nsu_key" ON "orders"("order_nsu");
CREATE INDEX "orders_store_id_status_created_at_idx" ON "orders"("store_id", "status", "created_at");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE UNIQUE INDEX "order_webhook_events_payload_hash_key" ON "order_webhook_events"("payload_hash");
CREATE INDEX "order_webhook_events_order_id_created_at_idx" ON "order_webhook_events"("order_id", "created_at");

ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_webhook_events" ADD CONSTRAINT "order_webhook_events_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
