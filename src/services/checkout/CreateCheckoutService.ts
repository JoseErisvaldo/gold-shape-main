import prismaClient from "../../prisma/index.js";
import type { CreateCheckoutInput } from "../../schema/checkoutSchema.js";
import { AppError } from "../../utils/app-error.js";

class CreateCheckoutService {
  async execute(input: CreateCheckoutInput) {
    const store = await prismaClient.store.findFirst({
      where: { active: true },
      select: { id: true, whatsapp: true },
    });
    if (!store) throw new AppError("Loja não encontrada", 404);

    const method = await prismaClient.paymentMethod.findFirst({
      where: { id: input.paymentMethodId, storeId: store.id, active: true },
    });
    if (!method) throw new AppError("Forma de pagamento inválida", 400);
    const isCash = method.name.toLocaleLowerCase("pt-BR") === "dinheiro";
    if (isCash && input.cashReceivedCents === undefined) {
      throw new AppError("Informe o valor que será entregue em dinheiro para calcular o troco", 400);
    }
    if (!isCash && input.cashReceivedCents !== undefined) {
      throw new AppError("O valor para troco só pode ser informado para pagamento em dinheiro", 400);
    }

    const variants = await prismaClient.productVariant.findMany({
      where: {
        id: { in: input.items.map(({ variantId }) => variantId) },
        active: true,
        product: { storeId: store.id, active: true },
      },
      select: {
        id: true, sku: true, size: true, flavor: true, price: true,
        discountPercentage: true, stockQuantity: true,
        product: { select: { name: true } },
      },
    });
    if (variants.length !== input.items.length) {
      throw new AppError("Um ou mais produtos não estão mais disponíveis", 400);
    }

    const area = input.deliveryFeePending
      ? null
      : await prismaClient.deliveryArea.findFirst({
          where: {
            id: input.deliveryAreaId ?? "",
            storeId: store.id,
            active: true,
            neighborhood: { equals: input.address.neighborhood, mode: "insensitive" },
            city: { equals: input.address.city, mode: "insensitive" },
            state: { equals: input.address.state, mode: "insensitive" },
          },
        });
    if (!input.deliveryFeePending && !area) {
      throw new AppError("A área de entrega selecionada não é válida", 400);
    }

    const byId = new Map(input.items.map((item) => [item.variantId, item]));
    const pix = method.name.toLocaleLowerCase("pt-BR") === "pix";
    const items = variants.map((variant) => {
      const requestItem = byId.get(variant.id);
      if (!requestItem || (variant.stockQuantity !== null && variant.stockQuantity < requestItem.quantity)) {
        throw new AppError(`Estoque insuficiente ou produto indisponível: ${variant.product.name}`, 400);
      }
      const full = Math.round(Number(variant.price) * 100);
      const unitPrice = pix
        ? Math.round(full * (1 - Number(variant.discountPercentage ?? 0) / 100))
        : full;
      if (requestItem.expectedUnitPriceCents !== unitPrice) {
        throw new AppError(
          "O preço de um produto mudou. O pedido não foi registrado; revise os valores atualizados.",
          409,
        );
      }
      const variantLabel = [variant.size, variant.flavor].filter(Boolean).join(" / ") || null;
      return {
        variantId: variant.id, productName: variant.product.name, variantLabel,
        sku: variant.sku, quantity: requestItem.quantity, unitPrice, regularUnitPrice: full,
      };
    });
    const deliveryFee = area ? Math.round(Number(area.shippingFee) * 100) : 0;
    const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, deliveryFee);
    if (isCash && input.cashReceivedCents !== undefined && input.cashReceivedCents < amount) {
      throw new AppError("O valor informado para pagamento em dinheiro é menor que o total", 400);
    }
    const order = await prismaClient.order.create({
      data: {
        storeId: store.id, orderNsu: crypto.randomUUID(), amount, deliveryFee,
        deliveryFeePending: input.deliveryFeePending,
        cashReceived: input.cashReceivedCents,
        customerName: input.customerName, whatsapp: input.whatsapp, paymentMethodId: method.id,
        cep: input.address.cep, street: input.address.street, number: input.address.number,
        neighborhood: input.address.neighborhood, city: input.address.city, state: input.address.state,
        complement: input.address.complement,
        items: { create: items.map(({ regularUnitPrice: _regularUnitPrice, ...item }) => item) },
      },
      select: { id: true, orderNsu: true, amount: true },
    });
    return {
      ...order,
      amount: order.amount / 100,
      deliveryFee: deliveryFee / 100,
      deliveryFeePending: input.deliveryFeePending,
      cashReceivedCents: input.cashReceivedCents ?? null,
      storeWhatsapp: store.whatsapp,
      paymentMethodName: method.name,
      items: items.map(({ variantId: _variantId, ...item }) => item),
    };
  }
}

export { CreateCheckoutService };
