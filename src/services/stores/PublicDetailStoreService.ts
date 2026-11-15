import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class PublicDetailStoreService {
  async execute() {
    try {
      const store = await prismaClient.store.findFirst({
        where: {
          active: true,
        },
        select: {
          name: true,
          slug: true,
          whatsapp: true,
        },
      });

      if (!store) {
        throw new AppError("Loja não encontrada", 404);
      }

      return store;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Erro ao consultar loja", 500);
    }
  }
}

export { PublicDetailStoreService };
