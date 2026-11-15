ALTER TABLE "stores"
ADD COLUMN "origin_cep" VARCHAR(9),
ADD COLUMN "origin_street" VARCHAR(200),
ADD COLUMN "origin_number" VARCHAR(30),
ADD COLUMN "origin_complement" VARCHAR(120),
ADD COLUMN "origin_neighborhood" VARCHAR(120),
ADD COLUMN "origin_city" VARCHAR(120),
ADD COLUMN "origin_state" CHAR(2);

CREATE TABLE "customer_addresses" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "label" VARCHAR(60) NOT NULL,
  "cep" VARCHAR(9) NOT NULL,
  "street" VARCHAR(200) NOT NULL,
  "number" VARCHAR(30) NOT NULL,
  "complement" VARCHAR(120),
  "neighborhood" VARCHAR(120) NOT NULL,
  "city" VARCHAR(120) NOT NULL,
  "state" CHAR(2) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customer_addresses_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "customer_addresses_user_id_created_at_idx"
ON "customer_addresses"("user_id", "created_at");

ALTER TABLE "orders"
ADD COLUMN "user_id" UUID,
ADD COLUMN "customer_address_id" UUID,
ADD COLUMN "seller_cep" VARCHAR(9),
ADD COLUMN "seller_street" VARCHAR(200),
ADD COLUMN "seller_number" VARCHAR(30),
ADD COLUMN "seller_complement" VARCHAR(120),
ADD COLUMN "seller_neighborhood" VARCHAR(120),
ADD COLUMN "seller_city" VARCHAR(120),
ADD COLUMN "seller_state" CHAR(2);

ALTER TABLE "orders"
ADD CONSTRAINT "orders_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT "orders_customer_address_id_fkey"
  FOREIGN KEY ("customer_address_id") REFERENCES "customer_addresses"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
