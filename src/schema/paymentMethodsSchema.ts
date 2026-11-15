import { z } from "zod";

export const CreateAcceptedCardSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80),
    paymentMethodId: z.string().uuid(),
  }).strict(),
});

export const UpdateActiveSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ active: z.boolean() }).strict(),
});

export const UpdateAcceptedCardSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ name: z.string().trim().min(1).max(80) }).strict(),
});

export type CreateAcceptedCardInput = z.infer<typeof CreateAcceptedCardSchema>["body"];
export type UpdateActiveInput = z.infer<typeof UpdateActiveSchema>["body"];
export type UpdateAcceptedCardInput = z.infer<typeof UpdateAcceptedCardSchema>["body"];
