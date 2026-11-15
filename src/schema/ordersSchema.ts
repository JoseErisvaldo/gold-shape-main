import { z } from "zod";

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data no formato AAAA-MM-DD")
  .optional();

export const ListOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(5).default(5),
    status: z
      .enum(["PENDING", "PAID", "CANCELED"])
      .optional(),
    name: z.string().trim().max(150).optional(),
    whatsapp: z.string().trim().max(20).optional(),
    delivery: z.string().trim().max(200).optional(),
    startDate: optionalDate,
    endDate: optionalDate,
  }),
});

export type ListOrdersQuery = z.infer<typeof ListOrdersSchema>["query"];

export const UpdateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ status: z.enum(["PENDING", "PAID", "CANCELED"]) }).strict(),
});
