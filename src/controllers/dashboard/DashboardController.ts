import type { Request, Response } from "express";
import { DashboardService } from "../../services/dashboard/DashboardService.js";

class DashboardController {
  async handle(_req: Request, res: Response): Promise<Response> {
    const dashboardService = new DashboardService();

    const dashboard = await dashboardService.execute();

    return res.status(200).json({
      data: dashboard,
    });
  }
}

export { DashboardController };
