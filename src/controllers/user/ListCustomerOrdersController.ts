import type { Request, Response } from "express";
import { ListCustomerOrdersSchema } from "../../schema/customerOrdersSchema.js";
import { ListCustomerOrdersService } from "../../services/user/ListCustomerOrdersService.js";

const customerOrdersService = new ListCustomerOrdersService();

class ListCustomerOrdersController {
  async handle(req: Request, res: Response) {
    const query = ListCustomerOrdersSchema.shape.query.parse(req.query);
    const result = await customerOrdersService.execute(req.user_id, query);
    return res.json(result);
  }
}

export { ListCustomerOrdersController };
