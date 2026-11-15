import { z } from "zod";

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
      deliveryAreaId: z.string().uuid().optional(),
      deliveryFeePending: z.boolean().default(false),
      cashReceivedCents: z.number().int().positive().optional(),
      customerName: z.string().trim().min(2).max(150),
      whatsapp: z.string().trim().min(10).max(20),
      paymentMethodId: z.string().uuid(),
      address: z
        .object({
          cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido"),
          street: z.string().trim().min(1).max(200),
          number: z.string().trim().min(1).max(30),
          neighborhood: z.string().trim().min(1).max(120),
          city: z.string().trim().min(1).max(120),
          state: z.string().trim().length(2),
          complement: z.string().trim().max(120).optional(),
        })
        .strict(),
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
    .refine(
      ({ deliveryAreaId, deliveryFeePending }) =>
        deliveryFeePending ? !deliveryAreaId : Boolean(deliveryAreaId),
      {
        message: "Informe uma área cadastrada ou marque a taxa de entrega como pendente",
        path: ["deliveryAreaId"],
      },
    )
});

export type CreateCheckoutInput = z.infer<typeof CreateCheckoutSchema>["body"];
