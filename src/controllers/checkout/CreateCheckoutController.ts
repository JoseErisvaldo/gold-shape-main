import type { Request, Response } from "express";
import { CreateCheckoutService } from "../../services/checkout/CreateCheckoutService.js";
import type { CreateCheckoutInput } from "../../schema/checkoutSchema.js";

class CreateCheckoutController {
  async handle(req: Request, res: Response) {
    const checkout = await new CreateCheckoutService().execute(
      req.body as CreateCheckoutInput,
    );

    return res.status(201).json(checkout);
  }
}

export { CreateCheckoutController };
