import type { Request, Response } from "express";
import { PublicDetailStoreService } from "../../services/stores/PublicDetailStoreService.js";

class PublicDetailStoreController {
  async handle(_req: Request, res: Response) {
    const publicDetailStoreService = new PublicDetailStoreService();
    const store = await publicDetailStoreService.execute();

    return res.status(200).json(store);
  }
}

export { PublicDetailStoreController };
