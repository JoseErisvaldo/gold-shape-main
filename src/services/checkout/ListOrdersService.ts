import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";
import type { ListOrdersQuery } from "../../schema/ordersSchema.js";

class ListOrdersService {
  async execute(query: ListOrdersQuery) {
    try {
      const where = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.name ? { customerName: { contains: query.name, mode: "insensitive" as const } } : {}),
        ...(query.whatsapp ? { whatsapp: { contains: query.whatsapp } } : {}),
        ...(query.delivery
          ? {
              OR: [
                { street: { contains: query.delivery, mode: "insensitive" as const } },
                { number: { contains: query.delivery, mode: "insensitive" as const } },
                { neighborhood: { contains: query.delivery, mode: "insensitive" as const } },
                { city: { contains: query.delivery, mode: "insensitive" as const } },
                { state: { contains: query.delivery, mode: "insensitive" as const } },
                { cep: { contains: query.delivery } },
                { complement: { contains: query.delivery, mode: "insensitive" as const } },
              ],
            }
          : {}),
        ...(query.startDate || query.endDate
          ? {
              createdAt: {
                ...(query.startDate ? { gte: new Date(`${query.startDate}T00:00:00.000Z`) } : {}),
                ...(query.endDate
                  ? { lt: new Date(new Date(`${query.endDate}T00:00:00.000Z`).getTime() + 86_400_000) }
                  : {}),
              },
            }
          : {}),
      };
      const [orders, total] = await prismaClient.$transaction([
        prismaClient.order.findMany({
          where,
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
          orderBy: { createdAt: "desc" },
          select: {
          id: true,
          orderNsu: true,
          status: true,
          amount: true,
          customerName: true,
          whatsapp: true,
          deliveryFee: true,
          deliveryFeePending: true,
          mercadoPagoPayment: {
            select: {
              mercadoPagoOrderId: true,
              mercadoPagoPaymentId: true,
              mercadoPagoStatus: true,
              mercadoPagoStatusDetail: true,
              paidAt: true,
              paymentMethod: { select: { name: true } },
            },
          },
          cep: true,
          street: true,
          number: true,
          neighborhood: true,
          city: true,
          state: true,
          complement: true,
          sellerCep: true,
          sellerStreet: true,
          sellerNumber: true,
          sellerComplement: true,
          sellerNeighborhood: true,
          sellerCity: true,
          sellerState: true,
          createdAt: true,
          items: {
            select: {
              productName: true,
              variantLabel: true,
              sku: true,
              quantity: true,
              unitPrice: true,
            },
          },
          },
        }),
        prismaClient.order.count({ where }),
      ]);
      return {
        orders: orders.map(({ mercadoPagoPayment, ...order }) => ({
          ...order,
          mercadoPagoOrderId: mercadoPagoPayment?.mercadoPagoOrderId ?? null,
          mercadoPagoPaymentId: mercadoPagoPayment?.mercadoPagoPaymentId ?? null,
          mercadoPagoStatus: mercadoPagoPayment?.mercadoPagoStatus ?? null,
          mercadoPagoStatusDetail: mercadoPagoPayment?.mercadoPagoStatusDetail ?? null,
          paymentMethod: mercadoPagoPayment?.paymentMethod ?? null,
          paidAt: mercadoPagoPayment?.paidAt ?? null,
        })),
        total,
        page: query.page,
        pageSize: query.pageSize,
      };
    } catch {
      throw new AppError("Erro ao consultar pedidos", 500);
    }
  }
}

export { ListOrdersService };
