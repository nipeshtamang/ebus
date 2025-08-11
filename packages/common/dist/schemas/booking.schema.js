import { z } from "zod";
import { PaymentMethod, } from "../types/booking.type";
// Search for trips
export const searchTripsSchema = z.object({
    origin: z.string().min(1, "Origin is required"),
    destination: z.string().min(1, "Destination is required"),
    departureDate: z.string().datetime("Invalid departure date"),
    returnDate: z.string().datetime("Invalid return date").optional(),
    passengers: z.number().min(1, "At least 1 passenger required").optional(),
});
// Passenger details for each seat
export const passengerDetailsSchema = z.object({
    seatNumber: z.string().min(1, "Seat number is required"),
    passengerName: z.string().min(1, "Passenger name is required"),
    passengerPhone: z.string().min(1, "Passenger phone is required"),
    passengerEmail: z.string().email("Invalid email format").optional(),
    passengerIdNumber: z.string().optional(), // For ID card/passport number
    passengerAge: z.number().min(0).max(120).optional(),
    passengerGender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
});
// Create booking with passenger details
export const createBookingSchema = z.object({
    scheduleId: z.number().positive("Invalid schedule ID"),
    passengers: z
        .array(passengerDetailsSchema)
        .min(1, "At least one passenger required"),
    returnScheduleId: z
        .number()
        .positive("Invalid return schedule ID")
        .optional(),
    returnPassengers: z.array(passengerDetailsSchema).optional(),
    // Main booker details (for contact purposes)
    bookerName: z.string().min(1, "Booker name is required"),
    bookerPhone: z.string().min(1, "Booker phone is required"),
    bookerEmail: z.string().email("Invalid email format").optional(),
});
// Cancel booking
export const cancelBookingSchema = z.object({
    bookingId: z.number().positive("Invalid booking ID"),
    reason: z.string().optional(),
    overrideCancellationPolicy: z.boolean().optional(),
});
// Payment
export const createPaymentSchema = z.object({
    bookingId: z.number().positive("Invalid booking ID"),
    amount: z.number().positive("Invalid amount"),
    method: z.nativeEnum(PaymentMethod),
});
// Refund
export const createRefundSchema = z.object({
    bookingId: z.number().positive("Invalid booking ID"),
    amount: z.number().positive("Invalid amount"),
    reason: z.string().min(1, "Refund reason is required"),
});
// Admin booking management with passenger details
export const adminCreateBookingSchema = z.object({
    userId: z.number().positive("Invalid user ID").optional(),
    scheduleId: z.number().positive("Invalid schedule ID"),
    passengers: z
        .array(passengerDetailsSchema)
        .min(1, "At least one passenger required"),
    returnScheduleId: z
        .number()
        .positive("Invalid return schedule ID")
        .optional(),
    returnPassengers: z.array(passengerDetailsSchema).optional(),
    // Main booker details (for contact purposes)
    bookerName: z.string().min(1, "Booker name is required"),
    bookerPhone: z.string().min(1, "Booker phone is required"),
    bookerEmail: z.string().email("Invalid email format").optional(),
    paymentMethod: z
        .enum(["CASH", "ESEWA", "KHALTI", "IPS_CONNECT", "BANK", "MANUAL"])
        .optional(),
});
// Seat reservation
export const reserveSeatsSchema = z.object({
    scheduleId: z.number().positive("Invalid schedule ID"),
    seatNumbers: z.array(z.string()).min(1, "At least one seat required"),
    holdDuration: z
        .number()
        .min(300, "Minimum hold duration is 5 minutes")
        .optional(), // in seconds
});
