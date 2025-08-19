"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reserveSeatsSchema = exports.adminCreateBookingSchema = exports.createRefundSchema = exports.createPaymentSchema = exports.cancelBookingSchema = exports.createBookingSchema = exports.passengerDetailsSchema = exports.searchTripsSchema = void 0;
const zod_1 = require("zod");
const booking_type_1 = require("../types/booking.type");
// Search for trips
exports.searchTripsSchema = zod_1.z.object({
    origin: zod_1.z.string().min(1, "Origin is required"),
    destination: zod_1.z.string().min(1, "Destination is required"),
    departureDate: zod_1.z.string().datetime("Invalid departure date"),
    returnDate: zod_1.z.string().datetime("Invalid return date").optional(),
    passengers: zod_1.z.number().min(1, "At least 1 passenger required").optional(),
});
// Passenger details for each seat
exports.passengerDetailsSchema = zod_1.z.object({
    seatNumber: zod_1.z.string().min(1, "Seat number is required"),
    passengerName: zod_1.z.string().min(1, "Passenger name is required"),
    passengerPhone: zod_1.z.string().min(1, "Passenger phone is required"),
    passengerEmail: zod_1.z.string().email("Invalid email format").optional(),
    passengerIdNumber: zod_1.z.string().optional(), // For ID card/passport number
    passengerAge: zod_1.z.number().min(0).max(120).optional(),
    passengerGender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});
// Create booking with passenger details
exports.createBookingSchema = zod_1.z.object({
    scheduleId: zod_1.z.number().positive("Invalid schedule ID"),
    passengers: zod_1.z
        .array(exports.passengerDetailsSchema)
        .min(1, "At least one passenger required"),
    returnScheduleId: zod_1.z
        .number()
        .positive("Invalid return schedule ID")
        .optional(),
    returnPassengers: zod_1.z.array(exports.passengerDetailsSchema).optional(),
    // Main booker details (for contact purposes)
    bookerName: zod_1.z.string().min(1, "Booker name is required"),
    bookerPhone: zod_1.z.string().min(1, "Booker phone is required"),
    bookerEmail: zod_1.z.string().email("Invalid email format").optional(),
});
// Cancel booking
exports.cancelBookingSchema = zod_1.z.object({
    bookingId: zod_1.z.number().positive("Invalid booking ID"),
    reason: zod_1.z.string().optional(),
    overrideCancellationPolicy: zod_1.z.boolean().optional(),
});
// Payment
exports.createPaymentSchema = zod_1.z.object({
    bookingId: zod_1.z.number().positive("Invalid booking ID"),
    amount: zod_1.z.number().positive("Invalid amount"),
    method: zod_1.z.nativeEnum(booking_type_1.PaymentMethod),
});
// Refund
exports.createRefundSchema = zod_1.z.object({
    bookingId: zod_1.z.number().positive("Invalid booking ID"),
    amount: zod_1.z.number().positive("Invalid amount"),
    reason: zod_1.z.string().min(1, "Refund reason is required"),
});
// Admin booking management with passenger details
exports.adminCreateBookingSchema = zod_1.z.object({
    userId: zod_1.z.number().positive("Invalid user ID").optional(),
    scheduleId: zod_1.z.number().positive("Invalid schedule ID"),
    passengers: zod_1.z
        .array(exports.passengerDetailsSchema)
        .min(1, "At least one passenger required"),
    returnScheduleId: zod_1.z
        .number()
        .positive("Invalid return schedule ID")
        .optional(),
    returnPassengers: zod_1.z.array(exports.passengerDetailsSchema).optional(),
    // Main booker details (for contact purposes)
    bookerName: zod_1.z.string().min(1, "Booker name is required"),
    bookerPhone: zod_1.z.string().min(1, "Booker phone is required"),
    bookerEmail: zod_1.z.string().email("Invalid email format").optional(),
    paymentMethod: zod_1.z
        .enum(["CASH", "ESEWA", "KHALTI", "IPS_CONNECT", "BANK", "MANUAL"])
        .optional(),
});
// Seat reservation
exports.reserveSeatsSchema = zod_1.z.object({
    scheduleId: zod_1.z.number().positive("Invalid schedule ID"),
    seatNumbers: zod_1.z.array(zod_1.z.string()).min(1, "At least one seat required"),
    holdDuration: zod_1.z
        .number()
        .min(300, "Minimum hold duration is 5 minutes")
        .optional(), // in seconds
});
