import { createBookingSchema, adminCreateBookingSchema } from "@ebusewa/common";
import * as bookingService from "../services/booking.service";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function createBooking(req, res) {
    try {
        const { success, data, error } = createBookingSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const userId = req.user.userId;
        // Transform the data to match the expected format
        const bookingData = {
            scheduleId: data.scheduleId,
            mainBooker: {
                userId,
                name: data.bookerName,
                phone: data.bookerPhone,
                email: data.bookerEmail || "",
            },
            seats: data.passengers.map((passenger) => ({
                seatNumber: passenger.seatNumber,
                passenger: {
                    name: passenger.passengerName,
                    phone: passenger.passengerPhone,
                    email: passenger.passengerEmail,
                    id: passenger.passengerIdNumber,
                },
            })),
        };
        const { order, bookings, ticket, ticketNumber } = await bookingService.createMultiSeatBookingWithEmail(bookingData);
        res.status(201).json({
            message: "Booking successful",
            order,
            bookings,
            ticket,
            ticketNumber,
        });
    }
    catch (error) {
        console.error("Error in createBooking:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getMyBookings(req, res) {
    try {
        const userId = req.user.userId;
        const list = await bookingService.listMyBookings(userId);
        res.json(list);
    }
    catch (error) {
        console.error("Error in getMyBookings:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getAllBookings(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.query.userId
            ? parseInt(req.query.userId)
            : undefined;
        const status = req.query.status;
        const result = await bookingService.listAllBookingsWithPagination({
            page,
            limit,
            userId,
            status,
        });
        res.json(result);
    }
    catch (error) {
        console.error("Error in getAllBookings:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getBookingById(req, res) {
    try {
        const bookingId = Number(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }
        const booking = await bookingService.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }
        res.json(booking);
    }
    catch (error) {
        console.error("Error in getBookingById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getBookingByTicketNumber(req, res) {
    try {
        const { ticketNumber } = req.params;
        if (!ticketNumber) {
            return res.status(400).json({ error: "Ticket number is required" });
        }
        const ticket = await bookingService.getBookingByTicketNumber(ticketNumber);
        if (!ticket) {
            return res
                .status(404)
                .json({ error: "Ticket not found with this ticket number" });
        }
        res.json(ticket);
    }
    catch (error) {
        console.error("Error in getBookingByTicketNumber:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function createBookingForUser(req, res) {
    try {
        console.log("Admin booking request body:", req.body);
        const { success, data, error } = adminCreateBookingSchema.safeParse(req.body);
        if (!success) {
            console.log("Schema validation failed:", error.flatten());
            return res.status(400).json(error.flatten());
        }
        const adminId = req.user.userId;
        console.log("Admin ID:", adminId);
        console.log("Validated data:", data);
        const result = await bookingService.createMultiSeatBookingForUser(adminId, data);
        const { order, bookings, ticket, ticketNumber } = result.onward;
        res.status(201).json({
            message: "Booking created successfully for user",
            order,
            bookings,
            ticket,
            ticketNumber,
            // Optionally include return trip info if needed:
            // return: result.return
        });
    }
    catch (error) {
        console.error("Error in createBookingForUser:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function cancelBooking(req, res) {
    try {
        const bookingId = Number(req.params.bookingId);
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }
        const userId = req.user.userId;
        const userRole = req.user.role;
        const result = await bookingService.cancelBooking(bookingId, userId, userRole);
        res.json({ message: "Booking cancelled", booking: result });
    }
    catch (error) {
        console.error("Error in cancelBooking:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function resetSeatStatus(req, res) {
    try {
        const { scheduleId } = req.params;
        const scheduleIdNum = Number(scheduleId);
        if (isNaN(scheduleIdNum)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        // Reset all seats for the schedule to unbooked
        await prisma.seat.updateMany({
            where: { scheduleId: scheduleIdNum },
            data: { isBooked: false },
        });
        res.json({
            message: `All seats for schedule ${scheduleId} have been reset to available`,
        });
    }
    catch (error) {
        console.error("Error in resetSeatStatus:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function cleanupOrphanedBookings(req, res) {
    try {
        const result = await bookingService.cleanupOrphanedBookings();
        res.json({
            message: `Cleaned up ${result.cleanedCount} orphaned bookings`,
            cleanedCount: result.cleanedCount,
        });
    }
    catch (error) {
        console.error("Error in cleanupOrphanedBookings:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function updateBookingStatus(req, res) {
    try {
        const bookingId = Number(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }
        const { status, reason } = req.body;
        const adminId = req.user.userId;
        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }
        const result = await bookingService.updateBookingStatus(bookingId, status, reason, adminId);
        res.json({ message: "Booking status updated", booking: result });
    }
    catch (error) {
        console.error("Error in updateBookingStatus:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function adminCancelBooking(req, res) {
    try {
        const bookingId = Number(req.params.bookingId);
        if (isNaN(bookingId)) {
            return res.status(400).json({ error: "Invalid booking ID" });
        }
        const { reason } = req.body;
        const adminId = req.user.userId;
        const result = await bookingService.adminCancelBooking(bookingId, reason, adminId);
        res.json({ message: "Booking cancelled by admin", booking: result });
    }
    catch (error) {
        console.error("Admin cancel booking error:", error);
        // Handle specific business logic errors with appropriate status codes
        if (error instanceof Error) {
            if (error.message.includes("not found")) {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes("already cancelled")) {
                return res.status(409).json({ error: error.message });
            }
        }
        // Default error response
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function removeSeatFromBooking(req, res) {
    try {
        const bookingId = Number(req.params.bookingId);
        const seatNumber = req.params.seatNumber;
        const adminId = req.user?.userId;
        console.log("[removeSeatFromBooking] bookingId:", bookingId, "seatNumber:", seatNumber, "adminId:", adminId);
        if (isNaN(bookingId) || !seatNumber) {
            console.error("[removeSeatFromBooking] Invalid booking ID or seat number", { bookingId, seatNumber });
            return res.status(400).json({
                error: "Invalid booking ID or seat number",
                bookingId,
                seatNumber,
            });
        }
        const result = await bookingService.removeSeatFromBooking(bookingId, seatNumber, adminId);
        res.json({ message: "Seat removed from booking", result });
    }
    catch (error) {
        console.error("[removeSeatFromBooking] Error:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
            details: error,
        });
    }
}
