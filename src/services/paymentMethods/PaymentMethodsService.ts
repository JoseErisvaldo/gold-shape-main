import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class PaymentMethodsService {
  async list(publicOnly = false) {
    try {
      const store = await prismaClient.store.findFirst({
        where: { active: true },
        select: { id: true },
      });
      if (!store) return [];
      return prismaClient.paymentMethod.findMany({
        where: {
          storeId: store.id,
          NOT: { name: { equals: "Dinheiro", mode: "insensitive" } },
          ...(publicOnly ? { active: true } : {}),
        },
        select: { id: true, name: true, ...(publicOnly ? {} : { active: true }) },
        orderBy: { createdAt: "asc" },
      });
    } catch {
      throw new AppError("Erro ao consultar formas de pagamento", 500);
    }
  }

  async updateActive(id: string, active: boolean) {
    try {
      const method = await prismaClient.paymentMethod.findUnique({
        where: { id },
        select: { name: true },
      });
      if (method?.name.toLocaleLowerCase("pt-BR") === "dinheiro") {
        throw new AppError("Pagamento em dinheiro não está disponível", 400);
      }
      const result = await prismaClient.$transaction(async (transaction) => {
        const updated = await transaction.paymentMethod.updateMany({
          where: { id, store: { active: true } },
          data: { active },
        });
        if (updated.count > 0 && !active) {
          await transaction.acceptedCard.updateMany({
            where: { paymentMethodId: id },
            data: { active: false },
          });
        }
        return updated;
      });
      if (!result.count) throw new AppError("Forma de pagamento não encontrada", 404);
      return { ok: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar forma de pagamento", 500);
    }
  }
}

export { PaymentMethodsService };
