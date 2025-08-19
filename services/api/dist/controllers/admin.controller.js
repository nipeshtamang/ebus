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
exports.revenueTrends = revenueTrends;
exports.seatUtilization = seatUtilization;
exports.cancellationStats = cancellationStats;
exports.reservationHoldAnalytics = reservationHoldAnalytics;
exports.listAuditLogs = listAuditLogs;
const adminService = __importStar(require("../services/admin.service"));
async function revenueTrends(req, res) {
    try {
        const data = await adminService.revenueTrends();
        res.json(data);
    }
    catch (error) {
        console.error("Error in revenueTrends:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function seatUtilization(req, res) {
    try {
        const data = await adminService.seatUtilization();
        res.json(data);
    }
    catch (error) {
        console.error("Error in seatUtilization:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function cancellationStats(req, res) {
    try {
        const data = await adminService.cancellationStats();
        res.json(data);
    }
    catch (error) {
        console.error("Error in cancellationStats:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function reservationHoldAnalytics(req, res) {
    try {
        const data = await adminService.reservationHoldAnalytics();
        res.json(data);
    }
    catch (error) {
        console.error("Error in reservationHoldAnalytics:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function listAuditLogs(req, res) {
    try {
        const logs = await adminService.listAuditLogs();
        res.json(logs);
    }
    catch (error) {
        console.error("Error in listAuditLogs:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
