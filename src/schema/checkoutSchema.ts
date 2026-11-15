import { z } from "zod";
import { isValidBrazilianDocument } from "../utils/is-valid-brazilian-document.js";

const identificationSchema = z
  .object({
    type: z.enum(["CPF", "CNPJ"]),
    number: z.string().regex(/^\d{11}$|^\d{14}$/),
  })
  .superRefine(({ type, number }, context) => {
    if (!isValidBrazilianDocument(type, number)) {
      context.addIssue({
        code: "custom",
        message: `Informe um ${type} válido`,
        path: ["number"],
      });
    }
  });

const paymentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("pix") }).strict(),
  z.object({
    type: z.literal("card"),
    token: z.string().min(1).max(2048),
    paymentMethodId: z.string().min(1).max(100),
    paymentTypeId: z.enum(["credit_card", "debit_card", "prepaid_card"]),
    installments: z.number().int().min(1).max(24),
    identification: identificationSchema.optional(),
  }).strict(),
]);

export const CreateCheckoutSchema = z.object({
  body: z
    .object({
      items: z
        .array(
          z.object({
            variantId: z.string().uuid(),
            quantity: z.number().int().min(1).max(99),
            expectedUnitPriceCents: z.number().int().positive(),
          }).strict(),
        )
        .min(1)
        .max(50),
      customerAddressId: z.string().uuid(),
      whatsapp: z.string().trim().min(10).max(20),
      paymentMethodId: z.string().uuid(),
      payment: paymentSchema,
    })
    .strict()
    .refine(
      ({ items }) =>
        new Set(items.map(({ variantId }) => variantId)).size === items.length,
      {
        message: "Não pode haver variações duplicadas no pedido",
        path: ["items"],
      },
    )
});

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>["body"];
export type CheckoutPayment = z.infer<typeof paymentSchema>;
