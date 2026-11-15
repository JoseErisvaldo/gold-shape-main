import type { Request, Response } from "express";
import { CreateAcceptedCardSchema, UpdateAcceptedCardSchema, UpdateActiveSchema } from "../../schema/paymentMethodsSchema.js";
import { AcceptedCardsService } from "../../services/paymentMethods/AcceptedCardsService.js";

class AcceptedCardsController {
  async listPublic(_: Request, res: Response) {
    return res.status(200).json(await new AcceptedCardsService().list(true));
  }

  async list(_: Request, res: Response) {
    return res.status(200).json(await new AcceptedCardsService().list());
  }

  async create(req: Request, res: Response) {
    const { body } = CreateAcceptedCardSchema.parse({ body: req.body });
    return res.status(201).json(await new AcceptedCardsService().create(body));
  }

  async updateActive(req: Request, res: Response) {
    const { id } = UpdateActiveSchema.shape.params.parse(req.params);
    const { active } = UpdateActiveSchema.shape.body.parse(req.body);
    return res.status(200).json(await new AcceptedCardsService().updateActive(id, active));
  }

  async update(req: Request, res: Response) {
    const { id } = UpdateAcceptedCardSchema.shape.params.parse(req.params);
    const { name } = UpdateAcceptedCardSchema.shape.body.parse(req.body);
    return res.status(200).json(await new AcceptedCardsService().update(id, name));
  }

  async delete(req: Request, res: Response) {
    const { id } = UpdateActiveSchema.shape.params.parse(req.params);
    return res.status(200).json(await new AcceptedCardsService().delete(id));
  }
}

export { AcceptedCardsController };
