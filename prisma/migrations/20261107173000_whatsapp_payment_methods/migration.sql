CREATE TABLE "payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders"
    ADD COLUMN "customer_name" VARCHAR(150),
    ADD COLUMN "whatsapp" VARCHAR(20),
    ADD COLUMN "payment_method_id" UUID,
    ADD COLUMN "delivery_fee" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "payment_methods_store_id_name_key" ON "payment_methods"("store_id", "name");
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "payment_methods" ("store_id", "name")
SELECT id, method FROM "stores"
CROSS JOIN (VALUES ('PIX'), ('Cartão Débito'), ('Cartão Crédito')) AS methods(method)
ON CONFLICT ("store_id", "name") DO NOTHING;
