import type { Request, Response } from "express";
import { PublicProductParamsSchema } from "../../schema/publicProductSchema.js";
import { PublicDetailProductService } from "../../services/product/PublicDetailProductService.js";

class PublicDetailProductController {
  async handle(req: Request, res: Response) {
    const { params } = PublicProductParamsSchema.parse({
      params: req.params,
    });

    const publicDetailProductService = new PublicDetailProductService();
    const product = await publicDetailProductService.execute(params.id);

    return res.status(200).json(product);
  }
}

export { PublicDetailProductController };
