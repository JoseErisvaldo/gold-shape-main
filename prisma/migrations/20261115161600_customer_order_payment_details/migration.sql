ALTER TABLE "orders"
ADD COLUMN "mercado_pago_payment_method_id" VARCHAR(80),
ADD COLUMN "mercado_pago_payment_type" VARCHAR(40),
ADD COLUMN "mercado_pago_installments" INTEGER;
