import type { Request, Response } from "express";
import { PublicListCategoriesService } from "../../services/category/PublicListCategoriesService.js";

class PublicListCategoriesController {
  async handle(_req: Request, res: Response) {
    const publicListCategoriesService = new PublicListCategoriesService();
    const categories = await publicListCategoriesService.execute();

    return res.status(200).json({
      data: categories,
    });
  }
}

export { PublicListCategoriesController };
