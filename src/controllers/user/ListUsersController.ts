import type { Request, Response } from "express";
import { ListUsersService } from "../../services/user/ListUsersService.js";

class ListUsersController {
  async handle(_req: Request, res: Response): Promise<Response> {
    const listUsersService = new ListUsersService();

    const users = await listUsersService.execute();

    return res.status(200).json({
      data: users,
    });
  }
}

export { ListUsersController };
