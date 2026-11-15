import type { Request, Response } from "express";
import { UpdateOrderStatusSchema } from "../../schema/ordersSchema.js";
import { UpdateOrderStatusService } from "../../services/checkout/UpdateOrderStatusService.js";

class UpdateOrderStatusController {
  async handle(req: Request, res: Response) {
    const { id } = UpdateOrderStatusSchema.shape.params.parse(req.params);
    const { status } = UpdateOrderStatusSchema.shape.body.parse(req.body);
    const order = await new UpdateOrderStatusService().execute({ id, status });
    return res.status(200).json(order);
  }
}

export { UpdateOrderStatusController };
