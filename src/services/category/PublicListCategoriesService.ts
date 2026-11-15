import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class PublicListCategoriesService {
  async execute() {
    try {
      const store = await prismaClient.store.findFirst({
        where: {
          active: true,
        },
        select: {
          id: true,
        },
      });

      if (!store) {
        throw new AppError("Loja não encontrada", 404);
      }

      const categories = await prismaClient.category.findMany({
        where: {
          storeId: store.id,
          active: true,
          productCategories: {
            some: {
              product: {
                storeId: store.id,
                active: true,
                variants: {
                  some: {
                    active: true,
                  },
                },
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return categories;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Erro ao listar categorias:", error);

      throw new AppError("Erro ao listar categorias", 500);
    }
  }
}

export { PublicListCategoriesService };
