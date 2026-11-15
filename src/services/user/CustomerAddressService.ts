import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";
import type { CustomerAddressInput } from "../../schema/customerAddressSchema.js";

class CustomerAddressService {
  async list(userId: string) {
    return prismaClient.customerAddress.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
  }

  async create(userId: string, data: CustomerAddressInput) {
    return prismaClient.customerAddress.create({
      data: { ...data, userId },
    });
  }

  async update(userId: string, id: string, data: CustomerAddressInput) {
    const address = await prismaClient.customerAddress.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!address) throw new AppError("Endereço não encontrado", 404);

    return prismaClient.customerAddress.update({
      where: { id: address.id },
      data,
    });
  }

  async delete(userId: string, id: string) {
    const address = await prismaClient.customerAddress.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!address) throw new AppError("Endereço não encontrado", 404);

    await prismaClient.customerAddress.delete({ where: { id: address.id } });
  }
}

export { CustomerAddressService };
