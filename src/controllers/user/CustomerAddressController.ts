import type { Request, Response } from "express";
import {
  CustomerAddressIdSchema,
  UpdateCustomerAddressSchema,
} from "../../schema/customerAddressSchema.js";
import { CustomerAddressService } from "../../services/user/CustomerAddressService.js";

const addressService = new CustomerAddressService();

class CustomerAddressController {
  async list(req: Request, res: Response) {
    const addresses = await addressService.list(req.user_id);
    return res.json(addresses);
  }

  async create(req: Request, res: Response) {
    const address = await addressService.create(req.user_id, req.body);
    return res.status(201).json(address);
  }

  async update(req: Request, res: Response) {
    const { id } = UpdateCustomerAddressSchema.shape.params.parse(req.params);
    const address = await addressService.update(req.user_id, id, req.body);
    return res.json(address);
  }

  async delete(req: Request, res: Response) {
    const { id } = CustomerAddressIdSchema.shape.params.parse(req.params);
    await addressService.delete(req.user_id, id);
    return res.status(204).send();
  }
}

export { CustomerAddressController };
