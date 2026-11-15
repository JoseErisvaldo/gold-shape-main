import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";
import type { CreateStoreInput } from "../../schema/storeSchema.js";

const acceptedCards = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
  "Hipercard",
  "Diners Club",
  "Discover",
  "JCB",
  "Cabal",
  "Banescard",
  "Alelo",
  "Pluxee",
  "Ticket",
  "VR",
  "Verocard",
  "Green Card",
  "Ben Visa Vale",
  "Up Brasil",
  "iFood Benefícios",
];

class CreateStoreService {
  async execute(data: CreateStoreInput) {
    const existingStore = await prismaClient.store.findFirst();

    if (existingStore) {
      throw new AppError("Já existe uma loja cadastrada", 409);
    }

    return prismaClient.store.create({
      data: {
        ...data,
        paymentMethods: {
          create: ["PIX", "Cartão Débito", "Cartão Crédito", "Dinheiro"].map((name) => ({
            name,
            ...(!name.toLocaleLowerCase("pt-BR").includes("cartão")
              ? {}
              : {
                  acceptedCards: {
                    create: acceptedCards.map((cardName) => ({ name: cardName, active: false })),
                  },
                }),
          })),
        },
      },
    });
  }
}

export { CreateStoreService };
