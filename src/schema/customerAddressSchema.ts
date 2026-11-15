import { z } from "zod";

const addressFieldsSchema = z.object({
  label: z.string().trim().min(1).max(60),
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido"),
  street: z.string().trim().min(1).max(200),
  number: z.string().trim().min(1).max(30),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
});

export const CreateCustomerAddressSchema = z.object({
  body: addressFieldsSchema.strict(),
});

export const UpdateCustomerAddressSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: addressFieldsSchema.strict(),
});

export const CustomerAddressIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CustomerAddressInput = z.infer<typeof addressFieldsSchema>;
