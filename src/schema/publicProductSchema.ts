import { z } from "zod";

export const PublicProductParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
