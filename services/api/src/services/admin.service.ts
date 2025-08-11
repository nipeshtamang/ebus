import { prisma } from "../config/db";

export async function revenueTrends() {
  // Example: total revenue per month
  return prisma.payment.groupBy({
    by: ["createdAt"],
    _sum: { amount: true },
    where: { status: "COMPLETED" },
    orderBy: { createdAt: "asc" },
  });
}

export async function seatUtilization() {
  // Example: seat utilization rate per schedule
  return prisma.schedule.findMany({
    select: {
      id: true,
      departure: true,
      bookings: true,
      seats: true,
    },
  });
}

export async function cancellationStats() {
  // Example: count of cancelled bookings per month
  return prisma.booking.groupBy({
    by: ["createdAt"],
    _count: { id: true },
    where: { status: "CANCELLED" },
    orderBy: { createdAt: "asc" },
  });
}

export async function reservationHoldAnalytics() {
  // Example: count of reservations by status
  return prisma.reservation.groupBy({
    by: ["status"],
    _count: { id: true },
  });
}

export async function listAuditLogs() {
  return prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
}
