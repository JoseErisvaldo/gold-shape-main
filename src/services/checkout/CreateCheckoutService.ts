import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import prismaClient from "../../prisma/index.js";
import type { CheckoutPayment, CreateCheckoutInput } from "../../schema/checkoutSchema.js";
import { AppError } from "../../utils/app-error.js";

const mercadoPagoOrderSchema = z.object({
  id: z.union([z.string(), z.number()]),
  status: z.string().optional(),
  status_detail: z.string().optional(),
  external_reference: z.string().optional(),
  transactions: z.object({
    payments: z.array(z.object({
      id: z.union([z.string(), z.number()]).optional(),
      status: z.string().optional(),
      status_detail: z.string().optional(),
      date_of_expiration: z.string().optional(),
      payment_method: z.object({
        id: z.string().optional(),
        qr_code: z.string().optional(),
        qr_code_base64: z.string().optional(),
        ticket_url: z.string().optional(),
      }).passthrough(),
    }).passthrough()),
  }).optional(),
}).passthrough();

const mercadoPagoErrorSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
  cause: z.array(z.object({
    code: z.union([z.string(), z.number()]).optional(),
  }).passthrough()).optional(),
}).passthrough();

type MercadoPagoOrder = z.infer<typeof mercadoPagoOrderSchema>;

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new AppError("O pagamento ainda não está configurado no servidor", 503);
  return token;
}

function getOrderStatus(providerStatus: string | undefined) {
  const status = providerStatus?.toLowerCase();
  if (status === "processed" || status === "approved" || status === "accredited") {
    return "PAID" as const;
  }
  if (
    status === "cancelled" ||
    status === "canceled" ||
    status === "expired" ||
    status === "rejected" ||
    status === "failed" ||
    status === "refunded" ||
    status === "charged_back"
  ) {
    return "CANCELED" as const;
  }
  return "PENDING" as const;
}

function getProviderOrderStatus(order: MercadoPagoOrder) {
  const orderStatus = getOrderStatus(order.status);
  return orderStatus === "PENDING"
    ? getOrderStatus(order.transactions?.payments[0]?.status)
    : orderStatus;
}

function getPaymentDetails(order: MercadoPagoOrder) {
  const payment = order.transactions?.payments[0];
  const method = payment?.payment_method;
  return {
    mercadoPagoOrderId: String(order.id),
    mercadoPagoPaymentId: payment?.id == null ? null : String(payment.id),
    mercadoPagoStatus: order.status ?? payment?.status ?? "pending",
    mercadoPagoStatusDetail: order.status_detail ?? payment?.status_detail ?? null,
    pixQrCode: method?.qr_code ?? null,
    pixQrCodeBase64: method?.qr_code_base64 ?? null,
    pixTicketUrl: method?.ticket_url ?? null,
    paymentExpiresAt: payment?.date_of_expiration
      ? new Date(payment.date_of_expiration)
      : null,
  };
}

function verifyWebhookSignature(
  orderId: string,
  requestId: string | undefined,
  signature: string | undefined,
) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !requestId || !signature) return false;
  const fields = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  if (!fields.ts || !fields.v1) return false;
  if (!/^[\da-f]{64}$/i.test(fields.v1)) return false;

  const manifest = `id:${orderId.toLowerCase()};request-id:${requestId};ts:${fields.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  const received = Buffer.from(fields.v1, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function getPaymentRequest(payment: CheckoutPayment, amount: string) {
  if (payment.type === "pix") {
    return {
      amount,
      payment_method: { id: "pix", type: "bank_transfer" },
      expiration_time: "PT24H",
    };
  }
  return {
    amount,
    payment_method: {
      id: payment.paymentMethodId,
      type: payment.paymentTypeId,
      token: payment.token,
      installments: payment.installments,
    },
  };
}

function validatePaymentMethod(name: string, payment: CheckoutPayment) {
  const normalized = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR");
  if (payment.type === "pix" && !normalized.includes("pix")) {
    throw new AppError("Selecione a forma de pagamento Pix", 400);
  }
  if (payment.type === "card") {
    if (!normalized.includes("cartao")) {
      throw new AppError("Selecione uma forma de pagamento com cartão", 400);
    }
    if (normalized.includes("credito") && payment.paymentTypeId !== "credit_card") {
      throw new AppError("A forma selecionada exige cartão de crédito", 400);
    }
    if (normalized.includes("debito") && payment.paymentTypeId !== "debit_card") {
      throw new AppError("A forma selecionada exige cartão de débito", 400);
    }
  }
}

async function updateOrderFromProvider(order: MercadoPagoOrder) {
  const externalReference = order.external_reference;
  if (!externalReference) {
    throw new AppError("Referência do pedido ausente na resposta do Mercado Pago", 502);
  }
  const current = await prismaClient.order.findUnique({
    where: { orderNsu: externalReference },
    select: { id: true, status: true, paidAt: true },
  });
  if (!current) return null;

  const nextStatus = getProviderOrderStatus(order);
  const finalStatus =
    current.status !== "PENDING" && nextStatus === "PENDING"
    ? current.status
    : nextStatus;
  const details = getPaymentDetails(order);
  return prismaClient.order.update({
    where: { id: current.id },
    data: {
      ...details,
      status: finalStatus,
      paidAt: finalStatus === "PAID" ? current.paidAt ?? new Date() : null,
    },
  });
}

class CreateCheckoutService {
  async execute(input: CreateCheckoutInput, userId: string) {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw new AppError("Usuário não encontrado", 401);

    const store = await prismaClient.store.findFirst({
      where: { active: true },
      select: {
        id: true,
        originCep: true,
        originStreet: true,
        originNumber: true,
        originComplement: true,
        originNeighborhood: true,
        originCity: true,
        originState: true,
      },
    });
    if (!store) throw new AppError("Loja não encontrada", 404);
    if (
      !store.originCep ||
      !store.originStreet ||
      !store.originNumber ||
      !store.originNeighborhood ||
      !store.originCity ||
      !store.originState
    ) {
      throw new AppError(
        "Configure o endereço de origem da loja antes de receber pedidos",
        409,
      );
    }

    const address = await prismaClient.customerAddress.findFirst({
      where: { id: input.customerAddressId, userId },
    });
    if (!address) throw new AppError("Endereço de entrega não encontrado", 404);

    const method = await prismaClient.paymentMethod.findFirst({
      where: { id: input.paymentMethodId, storeId: store.id, active: true },
    });
    if (!method || method.name.toLocaleLowerCase("pt-BR") === "dinheiro") {
      throw new AppError("Forma de pagamento inválida", 400);
    }
    validatePaymentMethod(method.name, input.payment);

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

    const byId = new Map(input.items.map((item) => [item.variantId, item]));
    const isPix = input.payment.type === "pix";
    const items = variants.map((variant) => {
      const requestItem = byId.get(variant.id);
      if (!requestItem || (variant.stockQuantity !== null && variant.stockQuantity < requestItem.quantity)) {
        throw new AppError("Estoque insuficiente ou produto indisponível", 400);
      }
      const regularUnitPrice = Math.round(Number(variant.price) * 100);
      const unitPrice = isPix
        ? Math.round(regularUnitPrice * (1 - Number(variant.discountPercentage ?? 0) / 100))
        : regularUnitPrice;
      if (requestItem.expectedUnitPriceCents !== unitPrice) {
        throw new AppError(
          "O preço de um produto mudou. Revise os valores atualizados.",
          409,
        );
      }
      const variantLabel = [variant.size, variant.flavor].filter(Boolean).join(" / ") || null;
      return {
        variantId: variant.id, productName: variant.product.name, variantLabel,
        sku: variant.sku, quantity: requestItem.quantity, unitPrice, regularUnitPrice,
      };
    });
    const deliveryFee = 0;
    const amount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, deliveryFee);
    const accessToken = getAccessToken();
    const orderNsu = randomUUID();
    const order = await prismaClient.order.create({
      data: {
        storeId: store.id,
        userId,
        customerAddressId: address.id,
        orderNsu,
        amount,
        deliveryFee,
        deliveryFeePending: false,
        customerName: user.name,
        whatsapp: input.whatsapp,
        paymentMethodId: method.id,
        cep: address.cep,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        complement: address.complement,
        sellerCep: store.originCep,
        sellerStreet: store.originStreet,
        sellerNumber: store.originNumber,
        sellerComplement: store.originComplement,
        sellerNeighborhood: store.originNeighborhood,
        sellerCity: store.originCity,
        sellerState: store.originState,
        items: {
          create: items.map(({ regularUnitPrice: _regularUnitPrice, ...item }) => item),
        },
      },
      select: { id: true, orderNsu: true },
    });

    let response: globalThis.Response;
    try {
      response = await fetch("https://api.mercadopago.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": order.id,
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          type: "online",
          processing_mode: "automatic",
          total_amount: (amount / 100).toFixed(2),
          external_reference: order.orderNsu,
          payer: {
            email: user.email,
            first_name:
              process.env.MP_PIX_APPROVAL_TEST_MODE === "true" &&
              input.payment.type === "pix"
                ? "APRO"
                : user.name,
            ...(input.payment.type === "card" && input.payment.identification
              ? { identification: input.payment.identification }
              : {}),
          },
          transactions: {
            payments: [getPaymentRequest(input.payment, (amount / 100).toFixed(2))],
          },
        }),
      });
    } catch (error) {
      await prismaClient.order.update({
        where: { id: order.id },
        data: { status: "CANCELED", mercadoPagoStatus: "creation_failed" },
      });
      console.error("Mercado Pago order request failed", error);
      throw new AppError("Não foi possível iniciar o pagamento", 502);
    }

    let providerPayload: unknown;
    try {
      providerPayload = await response.json();
    } catch (error) {
      await prismaClient.order.update({
        where: { id: order.id },
        data: { status: "CANCELED", mercadoPagoStatus: "invalid_response" },
      });
      console.error("Mercado Pago returned invalid order JSON", error);
      throw new AppError("Não foi possível iniciar o pagamento", 502);
    }
    const parsedOrder = mercadoPagoOrderSchema.safeParse(providerPayload);
    if (!parsedOrder.success) {
      await prismaClient.order.update({
        where: { id: order.id },
        data: { status: "CANCELED", mercadoPagoStatus: "creation_failed" },
      });
      const providerError = mercadoPagoErrorSchema.safeParse(providerPayload);
      console.error("Mercado Pago order creation failed", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        error: providerError.success ? providerError.data.error : undefined,
        message: providerError.success ? providerError.data.message : undefined,
        causeCodes: providerError.success
          ? providerError.data.cause?.map((cause) => cause.code).filter((code) => code !== undefined)
          : undefined,
        invalidResponseIssues: parsedOrder.error.issues.map((issue) => ({
          code: issue.code,
          path: issue.path.join("."),
        })),
      });
      throw new AppError("Não foi possível iniciar o pagamento", 502);
    }

    const providerOrder = parsedOrder.data;
    if (providerOrder.external_reference !== order.orderNsu) {
      await prismaClient.order.update({
        where: { id: order.id },
        data: { status: "CANCELED", mercadoPagoStatus: "invalid_reference" },
      });
      throw new AppError("A resposta do pagamento não corresponde ao pedido", 502);
    }
    if (!response.ok) {
      console.warn("Mercado Pago returned an unsuccessful order response", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        orderStatus: providerOrder.status,
        orderStatusDetail: providerOrder.status_detail,
        paymentStatus: providerOrder.transactions?.payments[0]?.status,
        paymentStatusDetail: providerOrder.transactions?.payments[0]?.status_detail,
      });
    }
    const details = getPaymentDetails(providerOrder);
    const status = getProviderOrderStatus(providerOrder);
    await prismaClient.order.update({
      where: { id: order.id },
      data: {
        ...details,
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });

    return {
      id: order.id,
      orderNsu: order.orderNsu,
      status,
      amount: amount / 100,
      deliveryFee: deliveryFee / 100,
      deliveryFeePending: false,
      paymentMethodName: method.name,
      paymentStatus: details.mercadoPagoStatus,
      paymentStatusDetail: details.mercadoPagoStatusDetail,
      pixQrCode: details.pixQrCode,
      pixQrCodeBase64: details.pixQrCodeBase64,
      pixTicketUrl: details.pixTicketUrl,
      paymentExpiresAt: details.paymentExpiresAt?.toISOString() ?? null,
      items: items.map(({ variantId: _variantId, ...item }) => item),
    };
  }
}

export async function getPublicCheckoutStatus(orderNsu: string, userId: string) {
  const order = await prismaClient.order.findUnique({
    where: { orderNsu, userId },
    select: {
      id: true,
      orderNsu: true,
      status: true,
      amount: true,
      deliveryFee: true,
      deliveryFeePending: true,
      mercadoPagoStatus: true,
      mercadoPagoStatusDetail: true,
      pixQrCode: true,
      pixQrCodeBase64: true,
      pixTicketUrl: true,
      paymentExpiresAt: true,
      paymentMethod: { select: { name: true } },
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
  });
  if (!order) throw new AppError("Pedido não encontrado", 404);
  return {
    ...order,
    amount: order.amount / 100,
    deliveryFee: order.deliveryFee / 100,
    paymentMethodName: order.paymentMethod?.name ?? null,
    paymentStatus: order.mercadoPagoStatus,
    paymentStatusDetail: order.mercadoPagoStatusDetail,
    paymentExpiresAt: order.paymentExpiresAt?.toISOString() ?? null,
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice / 100,
    })),
  };
}

export async function processMercadoPagoWebhook(
  body: unknown,
  queryOrderId: string | undefined,
  requestId: string | undefined,
  signature: string | undefined,
) {
  if (!process.env.MP_WEBHOOK_SECRET) {
    throw new AppError("Webhook do Mercado Pago não está configurado", 503);
  }
  const webhookSchema = z.object({
    data: z.object({ id: z.union([z.string(), z.number()]) }).optional(),
    id: z.union([z.string(), z.number()]).optional(),
  });
  const parsedBody = webhookSchema.safeParse(body);
  if (!parsedBody.success) throw new AppError("Notificação inválida", 400);
  const orderId = queryOrderId ?? String(parsedBody.data.data?.id ?? parsedBody.data.id ?? "");
  if (!orderId || !verifyWebhookSignature(orderId, requestId, signature)) {
    throw new AppError("Assinatura do webhook inválida", 401);
  }

  let response: globalThis.Response;
  try {
    response = await fetch(
      `https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        signal: AbortSignal.timeout(15_000),
      },
    );
  } catch (error) {
    console.error("Mercado Pago webhook order lookup failed", error);
    throw new AppError("Não foi possível consultar o pagamento", 502);
  }
  if (!response.ok) {
    console.error("Mercado Pago webhook order lookup failed", { status: response.status });
    throw new AppError("Não foi possível consultar o pagamento", 502);
  }
  let providerPayload: unknown;
  try {
    providerPayload = await response.json();
  } catch (error) {
    console.error("Mercado Pago webhook returned invalid order JSON", error);
    throw new AppError("Resposta inválida do Mercado Pago", 502);
  }
  const providerOrder = mercadoPagoOrderSchema.safeParse(providerPayload);
  if (!providerOrder.success) throw new AppError("Resposta inválida do Mercado Pago", 502);
  const updated = await updateOrderFromProvider(providerOrder.data);
  if (!updated) {
    console.warn("Mercado Pago order did not match a local order", {
      orderId: String(providerOrder.data.id),
    });
  }
}

export { CreateCheckoutService };
