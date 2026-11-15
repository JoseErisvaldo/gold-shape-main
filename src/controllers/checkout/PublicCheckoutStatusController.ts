import type { Request, Response } from "express";
import { getPublicCheckoutStatus } from "../../services/checkout/CreateCheckoutService.js";

class PublicCheckoutStatusController {
  async handle(req: Request, res: Response) {
    const rawOrderNsu = req.params.orderNsu;
    const orderNsu = Array.isArray(rawOrderNsu) ? rawOrderNsu[0] : rawOrderNsu;
    if (!orderNsu || orderNsu.length > 100) {
      return res.status(400).json({ error: "Identificador do pedido inválido" });
    }
    const status = await getPublicCheckoutStatus(orderNsu, req.user_id);
    return res.json(status);
  }
}

export { PublicCheckoutStatusController };
