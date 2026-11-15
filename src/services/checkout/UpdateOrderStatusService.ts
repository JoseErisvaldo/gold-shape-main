import { OrderStatus } from "../../generated/prisma/client.js";
import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

type UpdateOrderStatusInput = {
  id: string;
  status: "PENDING" | "PAID" | "CANCELED";
};

class UpdateOrderStatusService {
  async execute({ id, status }: UpdateOrderStatusInput) {
    try {
      return await prismaClient.$transaction(async (transaction) => {
        const order = await transaction.order.update({
          where: { id },
          data: { status: OrderStatus[status] },
          select: {
            id: true,
            status: true,
            mercadoPagoPayment: { select: { orderId: true } },
          },
        });
        const paidAt = status === "PAID" ? new Date() : null;

        if (order.mercadoPagoPayment) {
          await transaction.mercadoPagoPayment.update({
            where: { orderId: id },
            data: { paidAt },
          });
        } else if (paidAt) {
          await transaction.mercadoPagoPayment.create({
            data: { orderId: id, paidAt },
          });
        }

        return { id: order.id, status: order.status, paidAt };
      });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
        throw new AppError("Pedido não encontrado", 404);
      }
      throw new AppError("Não foi possível atualizar o status do pedido", 500);
    }
  }
}

export { UpdateOrderStatusService };
