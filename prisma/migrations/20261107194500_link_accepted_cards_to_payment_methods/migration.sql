ALTER TABLE "accepted_cards" ADD COLUMN IF NOT EXISTS "payment_method_id" UUID;

DROP INDEX IF EXISTS "accepted_cards_store_id_name_key";

INSERT INTO "accepted_cards" ("store_id", "name", "active", "payment_method_id")
SELECT cards."store_id", cards."name", cards."active", methods."id"
FROM "accepted_cards" AS cards
JOIN "payment_methods" AS methods
  ON methods."store_id" = cards."store_id"
 AND methods."active" = true
 AND methods."name" ILIKE '%cartão%'
WHERE cards."payment_method_id" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "accepted_cards" AS linked
    WHERE linked."payment_method_id" = methods."id"
      AND lower(linked."name") = lower(cards."name")
  );

DELETE FROM "accepted_cards" WHERE "payment_method_id" IS NULL;

ALTER TABLE "accepted_cards"
    DROP CONSTRAINT IF EXISTS "accepted_cards_store_id_fkey",
    DROP COLUMN "store_id",
    ALTER COLUMN "payment_method_id" SET NOT NULL;

CREATE UNIQUE INDEX "accepted_cards_payment_method_id_name_key"
    ON "accepted_cards"("payment_method_id", "name");
ALTER TABLE "accepted_cards"
    ADD CONSTRAINT "accepted_cards_payment_method_id_fkey"
    FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
