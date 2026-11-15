ALTER TABLE "orders"
ADD COLUMN "cash_received" INTEGER;

INSERT INTO "payment_methods" ("store_id", "name", "active")
SELECT "id", 'Dinheiro', true
FROM "stores"
ON CONFLICT ("store_id", "name") DO NOTHING;
