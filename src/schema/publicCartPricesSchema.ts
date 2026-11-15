import { z } from "zod";

export const PublicCartPricesSchema = z.object({
  body: z
    .object({
      items: z
        .array(
          z.object({
            variantId: z.string().uuid(),
            quantity: z.number().int().min(1).max(99),
          }).strict(),
        )
        .min(1)
        .max(50)
        .refine((items) => new Set(items.map(({ variantId }) => variantId)).size === items.length, {
          message: "Não pode haver variações duplicadas no carrinho",
        }),
    })
    .strict(),
});

export type PublicCartPricesInput = z.infer<typeof PublicCartPricesSchema>["body"];
