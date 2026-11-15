import { z } from "zod";

type OriginFields = {
  originCep?: string;
  originStreet?: string;
  originNumber?: string;
  originNeighborhood?: string;
  originCity?: string;
  originState?: string;
};

function validateOriginAddress(data: OriginFields, context: z.RefinementCtx) {
  const required = [
    data.originCep,
    data.originStreet,
    data.originNumber,
    data.originNeighborhood,
    data.originCity,
    data.originState,
  ];
  if (required.some(Boolean) && required.some((value) => !value)) {
    context.addIssue({
      code: "custom",
      message: "Informe todos os campos obrigatórios do endereço de origem",
      path: ["originCep"],
    });
  }
}

export const CreateStoreSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, "Name is required").max(150),
      slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .max(160)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
      whatsapp: z.string().trim().min(1, "WhatsApp is required").max(20),
      imageUrl: z.string().trim().url().max(2048).nullable().optional(),
      originCep: z.string().trim().regex(/^\d{5}-?\d{3}$/).optional(),
      originStreet: z.string().trim().min(1).max(200).optional(),
      originNumber: z.string().trim().min(1).max(30).optional(),
      originComplement: z.string().trim().max(120).optional(),
      originNeighborhood: z.string().trim().min(1).max(120).optional(),
      originCity: z.string().trim().min(1).max(120).optional(),
      originState: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    })
    .strict()
    .superRefine(validateOriginAddress),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>["body"];

export const UpdateStoreSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid store ID"),
  }),
  body: z
    .object({
      name: z.string().trim().min(1, "Name is required").max(150).optional(),
      slug: z
        .string()
        .trim()
        .min(1, "Slug is required")
        .max(160)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
        .optional(),
      whatsapp: z
        .string()
        .trim()
        .min(1, "WhatsApp is required")
        .max(20)
        .optional(),
      imageUrl: z.string().trim().url().max(2048).nullable().optional(),
      originCep: z.string().trim().regex(/^\d{5}-?\d{3}$/).optional(),
      originStreet: z.string().trim().min(1).max(200).optional(),
      originNumber: z.string().trim().min(1).max(30).optional(),
      originComplement: z.string().trim().max(120).optional(),
      originNeighborhood: z.string().trim().min(1).max(120).optional(),
      originCity: z.string().trim().min(1).max(120).optional(),
      originState: z.string().trim().length(2).transform((value) => value.toUpperCase()).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided",
    })
    .superRefine(validateOriginAddress),
});

export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>["body"];
