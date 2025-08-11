import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";

export async function getPaymentHistory(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.query.userId
      ? parseInt(req.query.userId as string)
      : undefined;
    const status = req.query.status as string;

    const result = await paymentService.getPaymentHistoryWithPagination({
      page,
      limit,
      userId,
      status,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in getPaymentHistory:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function getPaymentById(req: Request, res: Response) {
  try {
    const paymentId = Number(req.params.id);
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }

    const payment = await paymentService.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function processPayment(req: Request, res: Response) {
  try {
    const { bookingId, amount, method } = req.body;
    if (!bookingId || !amount || !method) {
      return res
        .status(400)
        .json({ error: "Missing bookingId, amount, or method" });
    }

    const result = await paymentService.processPayment({
      bookingId,
      amount,
      method,
    });

    res.json(result);
  } catch (error) {
    console.error("Error in processPayment:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function refundPayment(req: Request, res: Response) {
  try {
    const paymentId = Number(req.params.id);
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: "Invalid payment ID" });
    }

    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: "Refund reason is required" });
    }

    const result = await paymentService.refundPayment(paymentId, reason);
    res.json(result);
  } catch (error) {
    console.error("Error in refundPayment:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
