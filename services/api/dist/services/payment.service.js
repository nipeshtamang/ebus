import { PrismaClient } from "@prisma/client";
import { logAudit } from "./audit.service";
const prisma = new PrismaClient();
export async function getPaymentHistory() {
    try {
        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                booking: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                            },
                        },
                        seat: true,
                        order: {
                            include: {
                                bookings: { include: { seat: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Attach all seat numbers for the order to each payment
        return payments.map((payment) => {
            const orderBookings = payment.booking?.order?.bookings || [];
            return {
                ...payment,
                seatNumbers: orderBookings
                    .map((b) => b.seat?.seatNumber)
                    .filter(Boolean),
            };
        });
    }
    catch (error) {
        console.error("Error in getPaymentHistory:", error);
        throw error;
    }
}
export async function getPaymentHistoryWithPagination(params) {
    try {
        const { page, limit, userId, status } = params;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (status) {
            where.status = status;
        }
        // Get total count
        const total = await prisma.payment.count({ where });
        // Get paginated payments
        const payments = await prisma.payment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                booking: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                            },
                        },
                        seat: true,
                        order: {
                            include: {
                                bookings: { include: { seat: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });
        // Attach all seat numbers for the order to each payment
        const paymentsWithSeats = payments.map((payment) => {
            const orderBookings = payment.booking?.order?.bookings || [];
            return {
                ...payment,
                seatNumbers: orderBookings
                    .map((b) => b.seat?.seatNumber)
                    .filter(Boolean),
            };
        });
        const totalPages = Math.ceil(total / limit);
        return {
            payments: paymentsWithSeats,
            total,
            totalPages,
            currentPage: page,
        };
    }
    catch (error) {
        console.error("Error in getPaymentHistoryWithPagination:", error);
        throw error;
    }
}
export async function getPaymentById(paymentId) {
    try {
        return await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                booking: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error in getPaymentById:", error);
        throw error;
    }
}
export async function processPayment(data) {
    try {
        const { bookingId, amount, method } = data;
        // Validate booking exists
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                payment: true,
                schedule: {
                    include: {
                        route: true,
                    },
                },
                user: true,
                seat: true,
            },
        });
        if (!booking) {
            throw new Error("Booking not found");
        }
        // Check if payment already exists for this booking
        const existingPayment = await prisma.payment.findUnique({
            where: { bookingId },
        });
        if (existingPayment) {
            throw new Error("Payment already exists for this booking");
        }
        // Validate payment method
        const validMethods = ["ESEWA", "KHALTI", "IPS_CONNECT", "BANK", "CASH"];
        if (!validMethods.includes(method.toUpperCase())) {
            throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(", ")}`);
        }
        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId: booking.userId,
                bookingId,
                amount,
                method: method.toUpperCase(),
                status: "COMPLETED", // For admin-created bookings, mark as completed
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                booking: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });
        // Log audit
        await logAudit({
            userId: booking.userId,
            action: "CREATE_PAYMENT",
            entity: "Payment",
            entityId: payment.id,
            after: payment,
        });
        return payment;
    }
    catch (error) {
        console.error("Error in processPayment:", error);
        throw error;
    }
}
export async function refundPayment(paymentId, _reason) {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                booking: {
                    include: {
                        schedule: true,
                        user: true,
                    },
                },
            },
        });
        if (!payment) {
            throw new Error("Payment not found");
        }
        if (payment.status === "REFUNDED") {
            throw new Error("Payment has already been refunded");
        }
        if (payment.status !== "COMPLETED") {
            throw new Error("Only completed payments can be refunded");
        }
        // Calculate refund amount (full amount for admin refunds)
        const refundAmount = payment.amount;
        // Update payment status to refunded
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: "REFUNDED",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
                booking: {
                    include: {
                        schedule: {
                            include: {
                                route: true,
                            },
                        },
                        seat: true,
                    },
                },
            },
        });
        // Log audit
        await logAudit({
            userId: payment.userId,
            action: "REFUND_PAYMENT",
            entity: "Payment",
            entityId: paymentId,
            before: payment,
            after: updatedPayment,
        });
        return {
            ...updatedPayment,
            refundAmount,
            refundReason: _reason || "Admin refund",
        };
    }
    catch (error) {
        console.error("Error in refundPayment:", error);
        throw error;
    }
}
export async function getPaymentStats() {
    try {
        const totalPayments = await prisma.payment.count();
        const completedPayments = await prisma.payment.count({
            where: { status: "COMPLETED" },
        });
        const totalRevenue = await prisma.payment.aggregate({
            where: { status: "COMPLETED" },
            _sum: { amount: true },
        });
        const paymentsByMethod = await prisma.payment.groupBy({
            by: ["method"],
            where: { status: "COMPLETED" },
            _count: { method: true },
            _sum: { amount: true },
        });
        return {
            totalPayments,
            completedPayments,
            totalRevenue: totalRevenue._sum.amount || 0,
            paymentsByMethod,
        };
    }
    catch (error) {
        console.error("Error in getPaymentStats:", error);
        throw error;
    }
}
export async function processRefundWithCancellation(bookingId, reason, adminId) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                payment: true,
                schedule: {
                    include: {
                        route: true,
                    },
                },
                user: true,
                seat: true,
            },
        });
        if (!booking) {
            throw new Error("Booking not found");
        }
        if (booking.status === "CANCELLED") {
            throw new Error("Booking is already cancelled");
        }
        // Process refund and cancellation in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Cancel the booking
            const cancelledBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CANCELLED",
                },
            });
            // Free up the seat
            await tx.seat.update({
                where: { id: booking.seatId },
                data: { isBooked: false },
            });
            // Refund payment if exists
            let refundResult = null;
            if (booking.payment && booking.payment.status === "COMPLETED") {
                refundResult = await tx.payment.update({
                    where: { id: booking.payment.id },
                    data: {
                        status: "REFUNDED",
                    },
                });
            }
            return {
                booking: cancelledBooking,
                payment: refundResult,
                refundAmount: booking.payment?.amount || 0,
            };
        }, {
            timeout: 15000,
        });
        // Log audit
        await logAudit({
            userId: adminId,
            action: "REFUND_WITH_CANCELLATION",
            entity: "Booking",
            entityId: bookingId,
            before: booking,
            after: {
                ...result,
                reason,
                customerName: booking.user.name,
                customerPhone: booking.user.phoneNumber,
                route: `${booking.schedule.route.origin} → ${booking.schedule.route.destination}`,
            },
        });
        return result;
    }
    catch (error) {
        console.error("Error in processRefundWithCancellation:", error);
        throw error;
    }
}
