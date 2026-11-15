ALTER TABLE "orders"
    ALTER COLUMN "status" DROP DEFAULT;

UPDATE "orders" SET "status" = 'PAID' WHERE "status" = 'SETTLED';
UPDATE "orders" SET "status" = 'CANCELED' WHERE "status" IN ('REFUNDED', 'PAYMENT_FAILED');

ALTER TYPE "order_status" RENAME TO "order_status_old";
CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'CANCELED');

ALTER TABLE "orders"
    ALTER COLUMN "status" TYPE "order_status"
    USING "status"::text::"order_status",
    ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "order_status_old";
