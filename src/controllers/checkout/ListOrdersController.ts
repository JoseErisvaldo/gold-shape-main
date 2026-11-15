import type { Request, Response } from "express";
import { ListOrdersSchema } from "../../schema/ordersSchema.js";
import { ListOrdersService } from "../../services/checkout/ListOrdersService.js";

class ListOrdersController {
  async handle(req: Request, res: Response) {
    const query = ListOrdersSchema.shape.query.parse(req.query);
    const orders = await new ListOrdersService().execute(query);
    return res.status(200).json(orders);
  }
}

export { ListOrdersController };
