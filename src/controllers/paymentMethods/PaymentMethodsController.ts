import type { Request, Response } from "express";
import { UpdateActiveSchema } from "../../schema/paymentMethodsSchema.js";
import { PaymentMethodsService } from "../../services/paymentMethods/PaymentMethodsService.js";

class PaymentMethodsController {
  async listPublic(_: Request, res: Response) {
    return res.status(200).json(await new PaymentMethodsService().list(true));
  }

  async list(_: Request, res: Response) {
    return res.status(200).json(await new PaymentMethodsService().list());
  }

  async updateActive(req: Request, res: Response) {
    const { id } = UpdateActiveSchema.shape.params.parse(req.params);
    const { active } = UpdateActiveSchema.shape.body.parse(req.body);
    return res.status(200).json(await new PaymentMethodsService().updateActive(id, active));
  }
}

export { PaymentMethodsController };
