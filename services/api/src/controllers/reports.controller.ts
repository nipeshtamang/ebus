import { Request, Response } from "express";
import * as reportsService from "../services/reports.service";

export async function getSummaryReport(req: Request, res: Response) {
  try {
    const { dateFrom, dateTo, routeId, busId } = req.query;
    const summary = await reportsService.getSummaryReport({
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      routeId: routeId ? Number(routeId) : undefined,
      busId: busId ? Number(busId) : undefined,
    });
    res.json(summary);
  } catch (error) {
    console.error("Error in getSummaryReport:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
