import type { Request, Response } from "express";
import { PublicListProductsService } from "../../services/product/PublicListProductsService.js";
import { ListProductsSchema } from "../../schema/productSchema.js";

class PublicListProductsController {
  async handle(req: Request, res: Response) {
    const { query } = ListProductsSchema.parse({
      query: req.query,
    });

    const publicListProductsService = new PublicListProductsService();
    const result = await publicListProductsService.execute(query);

    return res.status(200).json(result);
  }
}

export { PublicListProductsController };
