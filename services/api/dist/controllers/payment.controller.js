"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentHistory = getPaymentHistory;
exports.getPaymentById = getPaymentById;
exports.processPayment = processPayment;
exports.refundPayment = refundPayment;
const paymentService = __importStar(require("../services/payment.service"));
async function getPaymentHistory(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.query.userId
            ? parseInt(req.query.userId)
            : undefined;
        const status = req.query.status;
        const result = await paymentService.getPaymentHistoryWithPagination({
            page,
            limit,
            userId,
            status,
        });
        res.json(result);
    }
    catch (error) {
        console.error("Error in getPaymentHistory:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getPaymentById(req, res) {
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
    }
    catch (error) {
        console.error("Error in getPaymentById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function processPayment(req, res) {
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
    }
    catch (error) {
        console.error("Error in processPayment:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function refundPayment(req, res) {
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
    }
    catch (error) {
        console.error("Error in refundPayment:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
