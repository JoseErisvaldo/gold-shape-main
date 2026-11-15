import prismaClient from "../../prisma/index.js";
import type { ListCustomerOrdersQuery } from "../../schema/customerOrdersSchema.js";

class ListCustomerOrdersService {
  async execute(userId: string, query: ListCustomerOrdersQuery) {
    const where = { userId };
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
          deliveryFee: true,
          deliveryFeePending: true,
          mercadoPagoOrderId: true,
          mercadoPagoPaymentId: true,
          mercadoPagoPaymentMethodId: true,
          mercadoPagoPaymentType: true,
          mercadoPagoInstallments: true,
          mercadoPagoStatus: true,
          mercadoPagoStatusDetail: true,
          pixQrCode: true,
          pixQrCodeBase64: true,
          pixTicketUrl: true,
          paymentExpiresAt: true,
          paidAt: true,
          createdAt: true,
          paymentMethod: { select: { name: true } },
          cep: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
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
      orders: orders.map((order) => ({
        ...order,
        amount: order.amount / 100,
        deliveryFee: order.deliveryFee / 100,
        paymentMethodName: order.paymentMethod?.name ?? null,
        paymentExpiresAt: order.paymentExpiresAt?.toISOString() ?? null,
        paidAt: order.paidAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: item.unitPrice / 100,
        })),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

export { ListCustomerOrdersService };
