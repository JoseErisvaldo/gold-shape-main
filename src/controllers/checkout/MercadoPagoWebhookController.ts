import type { Request, Response } from "express";
import { processMercadoPagoWebhook } from "../../services/checkout/CreateCheckoutService.js";

class MercadoPagoWebhookController {
  async handle(req: Request, res: Response) {
    const dataQuery = req.query.data;
    const nestedQueryId =
      typeof dataQuery === "object" && dataQuery !== null && "id" in dataQuery
        ? dataQuery.id
        : undefined;
    const queryId = req.query["data.id"] ?? nestedQueryId;
    await processMercadoPagoWebhook(
      req.body,
      typeof queryId === "string" ? queryId : undefined,
      req.header("x-request-id"),
      req.header("x-signature"),
    );
    return res.status(200).json({ ok: true });
  }
}

export { MercadoPagoWebhookController };
