"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueTrends = revenueTrends;
exports.seatUtilization = seatUtilization;
exports.cancellationStats = cancellationStats;
exports.reservationHoldAnalytics = reservationHoldAnalytics;
exports.listAuditLogs = listAuditLogs;
const db_1 = require("../config/db");
async function revenueTrends() {
    // Example: total revenue per month
    return db_1.prisma.payment.groupBy({
        by: ["createdAt"],
        _sum: { amount: true },
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "asc" },
    });
}
async function seatUtilization() {
    // Example: seat utilization rate per schedule
    return db_1.prisma.schedule.findMany({
        select: {
            id: true,
            departure: true,
            bookings: true,
            seats: true,
        },
    });
}
async function cancellationStats() {
    // Example: count of cancelled bookings per month
    return db_1.prisma.booking.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: { status: "CANCELLED" },
        orderBy: { createdAt: "asc" },
    });
}
async function reservationHoldAnalytics() {
    // Example: count of reservations by status
    return db_1.prisma.reservation.groupBy({
        by: ["status"],
        _count: { id: true },
    });
}
async function listAuditLogs() {
    return db_1.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
}
