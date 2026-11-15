CREATE TABLE "accepted_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "store_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "accepted_cards_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "accepted_cards_store_id_name_key" ON "accepted_cards"("store_id", "name");
ALTER TABLE "accepted_cards"
    ADD CONSTRAINT "accepted_cards_store_id_fkey"
    FOREIGN KEY ("store_id") REFERENCES "stores"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "accepted_cards" ("store_id", "name")
SELECT id, card FROM "stores"
CROSS JOIN (VALUES ('Visa'), ('Mastercard'), ('Elo'), ('American Express'), ('Hipercard')) AS cards(card)
ON CONFLICT ("store_id", "name") DO NOTHING;
