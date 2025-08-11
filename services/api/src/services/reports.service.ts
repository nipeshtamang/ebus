import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export interface ReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  routeId?: number;
  busId?: number;
}

// Type for booking where clause with schedule relation
interface BookingWhereWithSchedule extends Prisma.BookingWhereInput {
  schedule?: {
    routeId?: number;
    id?: { in: number[] };
  };
}

export async function getSummaryReport(filters: ReportFilters = {}) {
  try {
    const { dateFrom, dateTo, routeId, busId } = filters;

    // Build where clauses for payments/bookings
    const paymentWhere: Prisma.PaymentWhereInput = {
      status: "COMPLETED",
      deletedAt: null,
    };

    const bookingWhere: BookingWhereWithSchedule = {
      deletedAt: null,
    };

    if (dateFrom) {
      paymentWhere.createdAt = {
        gte: dateFrom,
      };
      bookingWhere.createdAt = {
        gte: dateFrom,
      };
    }

    if (dateTo) {
      paymentWhere.createdAt = {
        gte: dateFrom,
        lte: dateTo,
      };
      bookingWhere.createdAt = {
        gte: dateFrom,
        lte: dateTo,
      };
    }

    // Revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: paymentWhere,
      _sum: { amount: true },
    });

    // Revenue by month using Prisma instead of raw SQL
    const revenueByMonth = await prisma.payment.groupBy({
      by: ["createdAt"],
      _sum: { amount: true },
      where: paymentWhere,
    });

    // Transform to the expected format
    const revenueByMonthFormatted = revenueByMonth.map((item) => ({
      month: new Date(item.createdAt).toISOString().slice(0, 7), // YYYY-MM format
      revenue: item._sum.amount || 0,
    }));

    // Revenue by route using Prisma
    const revenueByRoute = await prisma.payment.findMany({
      where: {
        ...paymentWhere,
        booking: {
          schedule: {
            route: routeId ? { id: routeId } : undefined,
          },
        },
      },
      include: {
        booking: {
          include: {
            schedule: {
              include: {
                route: true,
              },
            },
          },
        },
      },
    });

    // Group by route
    const revenueByRouteGrouped = revenueByRoute.reduce(
      (acc, payment) => {
        const routeId = payment.booking?.schedule?.route?.id;
        const routeName =
          payment.booking?.schedule?.route?.name || "Unknown Route";

        if (routeId) {
          if (!acc[routeId]) {
            acc[routeId] = { routeId, routeName, revenue: 0 };
          }
          acc[routeId].revenue += payment.amount || 0;
        }
        return acc;
      },
      {} as Record<
        number,
        { routeId: number; routeName: string; revenue: number }
      >
    );

    const revenueByRouteFormatted = Object.values(revenueByRouteGrouped).sort(
      (a, b) => b.revenue - a.revenue
    );

    const revenueByPaymentMethod = await prisma.payment.groupBy({
      by: ["method"],
      _sum: { amount: true },
      where: paymentWhere,
    });

    // Bookings
    if (routeId) {
      bookingWhere.schedule = { routeId };
    }

    // Handle busId filtering by getting schedule IDs first
    let scheduleIds: number[] | undefined;
    if (busId) {
      const schedules = await prisma.schedule.findMany({
        where: { busId },
        select: { id: true },
      });
      scheduleIds = schedules.map((s) => s.id);
    }

    if (scheduleIds && scheduleIds.length > 0) {
      if (bookingWhere.schedule && typeof bookingWhere.schedule === "object") {
        bookingWhere.schedule = {
          ...bookingWhere.schedule,
          id: { in: scheduleIds },
        };
      } else {
        bookingWhere.schedule = { id: { in: scheduleIds } };
      }
    } else if (busId && (!scheduleIds || scheduleIds.length === 0)) {
      // If busId is provided but no schedules found, return empty results
      return {
        revenue: { total: 0, byMonth: [], byRoute: [], byPaymentMethod: [] },
        bookings: { total: 0, byMonth: [], byRoute: [], byStatus: [] },
        users: { newByMonth: [], activeByMonth: [] },
        fleet: { busUsage: [], occupancyRate: [] },
      };
    }

    const totalBookings = await prisma.booking.count({ where: bookingWhere });

    // Bookings by month using Prisma
    const bookingsByMonth = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: bookingWhere,
    });

    const bookingsByMonthFormatted = bookingsByMonth.map((item) => ({
      month: new Date(item.createdAt).toISOString().slice(0, 7),
      count: item._count.id,
    }));

    // Bookings by route using Prisma
    const bookingsByRoute = await prisma.booking.findMany({
      where: bookingWhere,
      include: {
        schedule: {
          include: {
            route: true,
          },
        },
      },
    });

    const bookingsByRouteGrouped = bookingsByRoute.reduce(
      (acc, booking) => {
        const routeId = booking.schedule?.route?.id;
        const routeName = booking.schedule?.route?.name || "Unknown Route";

        if (routeId) {
          if (!acc[routeId]) {
            acc[routeId] = { routeId, routeName, count: 0 };
          }
          acc[routeId].count += 1;
        }
        return acc;
      },
      {} as Record<
        number,
        { routeId: number; routeName: string; count: number }
      >
    );

    const bookingsByRouteFormatted = Object.values(bookingsByRouteGrouped).sort(
      (a, b) => b.count - a.count
    );

    const bookingsByStatus = await prisma.booking.groupBy({
      by: ["status"],
      _count: { status: true },
      where: bookingWhere,
    });

    // Users by month using Prisma
    const userWhere: Prisma.UserWhereInput = {};
    if (dateFrom) userWhere.createdAt = { gte: dateFrom };
    if (dateTo) {
      if (userWhere.createdAt && typeof userWhere.createdAt === "object") {
        userWhere.createdAt = { ...userWhere.createdAt, lte: dateTo };
      } else {
        userWhere.createdAt = { lte: dateTo };
      }
    }

    const newUsersByMonth = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: userWhere,
    });

    const newUsersByMonthFormatted = newUsersByMonth.map((item) => ({
      month: new Date(item.createdAt).toISOString().slice(0, 7),
      count: item._count.id,
    }));

    // Active users by month (users who made bookings)
    const activeUsersByMonth = await prisma.booking.groupBy({
      by: ["createdAt"],
      _count: { userId: true },
      where: {
        ...bookingWhere,
        createdAt: {
          gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), // Last 12 months
        },
      },
    });

    const activeUsersByMonthFormatted = activeUsersByMonth.map((item) => ({
      month: new Date(item.createdAt).toISOString().slice(0, 7),
      count: item._count.userId,
    }));

    // Fleet utilization using Prisma
    const busWhere: Prisma.BusWhereInput = {};
    if (busId !== undefined) {
      busWhere.id = { equals: busId };
    }

    const busUsage = await prisma.bus.findMany({
      where: busWhere,
      include: {
        schedules: {
          where: {
            ...(dateFrom && { departure: { gte: dateFrom } }),
            ...(dateTo && { departure: { lte: dateTo } }),
          },
        },
      },
    });

    const busUsageFormatted = busUsage.map((bus) => ({
      busId: bus.id,
      busName: bus.name,
      trips: bus.schedules.length,
    }));

    // Occupancy rate calculation
    const occupancyRate = await prisma.bus.findMany({
      where: busWhere,
      include: {
        schedules: {
          include: {
            seats: {
              include: {
                booking: true,
              },
            },
          },
          where: {
            ...(dateFrom && { departure: { gte: dateFrom } }),
            ...(dateTo && { departure: { lte: dateTo } }),
          },
        },
      },
    });

    const occupancyRateFormatted = occupancyRate.map((bus) => {
      const totalSeats = bus.schedules.reduce(
        (sum, schedule) => sum + schedule.seats.length,
        0
      );
      const bookedSeats = bus.schedules.reduce(
        (sum, schedule) =>
          sum +
          schedule.seats.filter(
            (seat) => seat.booking && seat.booking.deletedAt === null
          ).length,
        0
      );

      return {
        busId: bus.id,
        busName: bus.name,
        occupancy: totalSeats > 0 ? bookedSeats / totalSeats : 0,
      };
    });

    return {
      revenue: {
        total: totalRevenue._sum.amount || 0,
        byMonth: revenueByMonthFormatted,
        byRoute: revenueByRouteFormatted,
        byPaymentMethod: revenueByPaymentMethod,
      },
      bookings: {
        total: totalBookings,
        byMonth: bookingsByMonthFormatted,
        byRoute: bookingsByRouteFormatted,
        byStatus: bookingsByStatus,
      },
      users: {
        newByMonth: newUsersByMonthFormatted,
        activeByMonth: activeUsersByMonthFormatted,
      },
      fleet: {
        busUsage: busUsageFormatted,
        occupancyRate: occupancyRateFormatted,
      },
    };
  } catch (error) {
    console.error("Error in getSummaryReport:", error);
    throw new Error("Failed to generate summary report");
  }
}
