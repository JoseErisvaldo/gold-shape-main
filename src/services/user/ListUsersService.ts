import prismaClient from "../../prisma/index.js";
import { AppError } from "../../utils/app-error.js";

class ListUsersService {
  async execute() {
    try {
      const users = await prismaClient.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return users;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Erro ao listar usuários:", error);

      throw new AppError("Erro ao listar usuários", 500);
    }
  }
}

export { ListUsersService };
