WITH card_names(name) AS (
    VALUES
        ('Visa'),
        ('Mastercard'),
        ('Elo'),
        ('American Express'),
        ('Hipercard'),
        ('Diners Club'),
        ('Discover'),
        ('JCB'),
        ('Cabal'),
        ('Banescard'),
        ('Alelo'),
        ('Pluxee'),
        ('Ticket'),
        ('VR'),
        ('Verocard'),
        ('Green Card'),
        ('Ben Visa Vale'),
        ('Up Brasil'),
        ('iFood Benefícios')
)
INSERT INTO "accepted_cards" ("payment_method_id", "name", "active")
SELECT methods."id", cards."name", false
FROM "payment_methods" AS methods
CROSS JOIN card_names AS cards
WHERE methods."name" IN ('Cartão Crédito', 'Cartão Débito')
ON CONFLICT ("payment_method_id", "name") DO NOTHING;

UPDATE "accepted_cards"
SET "active" = false;
