import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class DashboardService {
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

      const [
        products,
        featuredProducts,
        discountedProducts,
        inactiveProducts,
        categories,
        users,
      ] = await Promise.all([
        prismaClient.product.count({
          where: {
            storeId: store.id,
          },
        }),
        prismaClient.product.count({
          where: {
            storeId: store.id,
            featured: true,
          },
        }),
        prismaClient.product.count({
          where: {
            storeId: store.id,
            active: true,
            variants: {
              some: {
                active: true,
                discountPercentage: {
                  gt: 0,
                },
              },
            },
          },
        }),
        prismaClient.product.count({
          where: {
            storeId: store.id,
            active: false,
          },
        }),
        prismaClient.category.count({
          where: {
            storeId: store.id,
          },
        }),
        prismaClient.user.count(),
      ]);

      return {
        totals: {
          products,
          featuredProducts,
          discountedProducts,
          inactiveProducts,
          categories,
          users,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Erro ao carregar dashboard:", error);

      throw new AppError("Erro ao carregar dashboard", 500);
    }
  }
}

export { DashboardService };
