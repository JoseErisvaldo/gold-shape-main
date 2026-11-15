import { z } from "zod";

export const ListCustomerOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(20).default(10),
  }),
});

export type ListCustomerOrdersQuery = z.infer<
  typeof ListCustomerOrdersSchema
>["query"];
