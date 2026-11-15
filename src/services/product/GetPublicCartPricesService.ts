import prismaClient from "../../prisma/index.js";
import type { PublicCartPricesInput } from "../../schema/publicCartPricesSchema.js";
import { AppError } from "../../utils/app-error.js";

class GetPublicCartPricesService {
  async execute(input: PublicCartPricesInput) {
    try {
      const store = await prismaClient.store.findFirst({
        where: { active: true },
        select: { id: true },
      });
      if (!store) throw new AppError("Loja não encontrada", 404);

      const variants = await prismaClient.productVariant.findMany({
        where: {
          id: { in: input.items.map(({ variantId }) => variantId) },
          active: true,
          product: { storeId: store.id, active: true },
        },
        select: {
          id: true,
          price: true,
          discountPercentage: true,
          stockQuantity: true,
        },
      });

      const quantities = new Map(input.items.map(({ variantId, quantity }) => [variantId, quantity]));
      const foundIds = new Set(variants.map(({ id }) => id));
      return {
        variants: variants.map((variant) => {
          const quantity = quantities.get(variant.id) ?? 0;
          return {
            id: variant.id,
            price: Number(variant.price),
            discountPercentage: variant.discountPercentage === null
              ? null
              : Number(variant.discountPercentage),
            stockQuantity: variant.stockQuantity,
            available:
              variant.stockQuantity === null ||
              variant.stockQuantity >= quantity,
          };
        }),
        unavailableVariantIds: input.items
          .filter(({ variantId }) => !foundIds.has(variantId))
          .map(({ variantId }) => variantId),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Erro ao atualizar preços do carrinho", 500);
    }
  }
}

export { GetPublicCartPricesService };
