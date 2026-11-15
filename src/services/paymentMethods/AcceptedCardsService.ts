import type { CreateAcceptedCardInput } from "../../schema/paymentMethodsSchema.js";
import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class AcceptedCardsService {
  async list(publicOnly = false) {
    try {
      const store = await prismaClient.store.findFirst({
        where: { active: true },
        select: { id: true },
      });
      if (!store) return [];
      return prismaClient.acceptedCard.findMany({
        where: {
          ...(publicOnly ? { active: true, paymentMethod: { active: true } } : {}),
          paymentMethod: {
            storeId: store.id,
            ...(publicOnly ? { active: true } : {}),
          },
        },
        select: {
          id: true,
          name: true,
          paymentMethodId: true,
          ...(publicOnly ? {} : { active: true }),
        },
        orderBy: { name: "asc" },
      });
    } catch {
      throw new AppError("Erro ao consultar bandeiras de cartão", 500);
    }
  }

  async create(input: CreateAcceptedCardInput) {
    const store = await prismaClient.store.findFirst({
      where: { active: true },
      select: { id: true },
    });
    if (!store) throw new AppError("Loja não encontrada", 404);
    const paymentMethod = await prismaClient.paymentMethod.findFirst({
      where: {
        id: input.paymentMethodId,
        storeId: store.id,
        name: { contains: "cartão", mode: "insensitive" },
      },
      select: { id: true },
    });
    if (!paymentMethod) throw new AppError("Selecione Cartão Crédito ou Cartão Débito", 400);
    try {
      return await prismaClient.acceptedCard.create({
        data: { ...input, paymentMethodId: paymentMethod.id },
        select: { id: true, name: true, active: true, paymentMethodId: true },
      });
    } catch {
      throw new AppError("A bandeira já está cadastrada para essa forma de cartão", 409);
    }
  }

  async updateActive(id: string, active: boolean) {
    try {
      const result = await prismaClient.acceptedCard.updateMany({
        where: {
          id,
          paymentMethod: {
            ...(active ? { active: true } : {}),
            store: { active: true },
          },
        },
        data: { active },
      });
      if (!result.count) throw new AppError("Bandeira não encontrada ou forma de cartão inativa", 404);
      return { ok: true };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar bandeira", 500);
    }

  }

  async update(id: string, name: string) {
    try {
      return await prismaClient.acceptedCard.update({
        where: { id },
        data: { name },
        select: { id: true, name: true, active: true, paymentMethodId: true },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new AppError("Já existe uma bandeira com esse nome para essa forma de cartão", 409);
      }
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        throw new AppError("Bandeira não encontrada", 404);
      }
      throw new AppError("Erro ao editar bandeira", 500);
    }
  }

  async delete(id: string) {
    try {
      await prismaClient.acceptedCard.delete({ where: { id } });
      return { ok: true };
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        throw new AppError("Bandeira não encontrada", 404);
      }
      throw new AppError("Erro ao excluir bandeira", 500);
    }
  }
}

export { AcceptedCardsService };
