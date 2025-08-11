import { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  res.status(status).json({
    status: "error",
    message: err.message || "Internal Server Error",
    details: err.details || null,
  });
}
