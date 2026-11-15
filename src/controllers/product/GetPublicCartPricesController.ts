import type { Request, Response } from "express";
import { PublicCartPricesSchema } from "../../schema/publicCartPricesSchema.js";
import { GetPublicCartPricesService } from "../../services/product/GetPublicCartPricesService.js";

class GetPublicCartPricesController {
  async handle(req: Request, res: Response) {
    const { body } = PublicCartPricesSchema.parse({ body: req.body });
    const result = await new GetPublicCartPricesService().execute(body);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(result);
  }
}

export { GetPublicCartPricesController };
