import { z } from "zod";
import { PaymentMethod } from "../types/booking.type";
export declare const searchTripsSchema: z.ZodObject<{
    origin: z.ZodString;
    destination: z.ZodString;
    departureDate: z.ZodString;
    returnDate: z.ZodOptional<z.ZodString>;
    passengers: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
    passengers?: number | undefined;
}, {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | undefined;
    passengers?: number | undefined;
}>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export declare const passengerDetailsSchema: z.ZodObject<{
    seatNumber: z.ZodString;
    passengerName: z.ZodString;
    passengerPhone: z.ZodString;
    passengerEmail: z.ZodOptional<z.ZodString>;
    passengerIdNumber: z.ZodOptional<z.ZodString>;
    passengerAge: z.ZodOptional<z.ZodNumber>;
    passengerGender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
}, "strip", z.ZodTypeAny, {
    seatNumber: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string | undefined;
    passengerIdNumber?: string | undefined;
    passengerAge?: number | undefined;
    passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
}, {
    seatNumber: string;
    passengerName: string;
    passengerPhone: string;
    passengerEmail?: string | undefined;
    passengerIdNumber?: string | undefined;
    passengerAge?: number | undefined;
    passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
}>;
export type PassengerDetails = z.infer<typeof passengerDetailsSchema>;
export declare const createBookingSchema: z.ZodObject<{
    scheduleId: z.ZodNumber;
    passengers: z.ZodArray<z.ZodObject<{
        seatNumber: z.ZodString;
        passengerName: z.ZodString;
        passengerPhone: z.ZodString;
        passengerEmail: z.ZodOptional<z.ZodString>;
        passengerIdNumber: z.ZodOptional<z.ZodString>;
        passengerAge: z.ZodOptional<z.ZodNumber>;
        passengerGender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    }, "strip", z.ZodTypeAny, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }>, "many">;
    returnScheduleId: z.ZodOptional<z.ZodNumber>;
    returnPassengers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        seatNumber: z.ZodString;
        passengerName: z.ZodString;
        passengerPhone: z.ZodString;
        passengerEmail: z.ZodOptional<z.ZodString>;
        passengerIdNumber: z.ZodOptional<z.ZodString>;
        passengerAge: z.ZodOptional<z.ZodNumber>;
        passengerGender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    }, "strip", z.ZodTypeAny, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }>, "many">>;
    bookerName: z.ZodString;
    bookerPhone: z.ZodString;
    bookerEmail: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    passengers: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[];
    scheduleId: number;
    bookerName: string;
    bookerPhone: string;
    returnScheduleId?: number | undefined;
    returnPassengers?: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[] | undefined;
    bookerEmail?: string | undefined;
}, {
    passengers: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[];
    scheduleId: number;
    bookerName: string;
    bookerPhone: string;
    returnScheduleId?: number | undefined;
    returnPassengers?: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[] | undefined;
    bookerEmail?: string | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export declare const cancelBookingSchema: z.ZodObject<{
    bookingId: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    overrideCancellationPolicy: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    bookingId: number;
    reason?: string | undefined;
    overrideCancellationPolicy?: boolean | undefined;
}, {
    bookingId: number;
    reason?: string | undefined;
    overrideCancellationPolicy?: boolean | undefined;
}>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export declare const createPaymentSchema: z.ZodObject<{
    bookingId: z.ZodNumber;
    amount: z.ZodNumber;
    method: z.ZodNativeEnum<typeof PaymentMethod>;
}, "strip", z.ZodTypeAny, {
    bookingId: number;
    amount: number;
    method: PaymentMethod;
}, {
    bookingId: number;
    amount: number;
    method: PaymentMethod;
}>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export declare const createRefundSchema: z.ZodObject<{
    bookingId: z.ZodNumber;
    amount: z.ZodNumber;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookingId: number;
    reason: string;
    amount: number;
}, {
    bookingId: number;
    reason: string;
    amount: number;
}>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
export declare const adminCreateBookingSchema: z.ZodObject<{
    userId: z.ZodOptional<z.ZodNumber>;
    scheduleId: z.ZodNumber;
    passengers: z.ZodArray<z.ZodObject<{
        seatNumber: z.ZodString;
        passengerName: z.ZodString;
        passengerPhone: z.ZodString;
        passengerEmail: z.ZodOptional<z.ZodString>;
        passengerIdNumber: z.ZodOptional<z.ZodString>;
        passengerAge: z.ZodOptional<z.ZodNumber>;
        passengerGender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    }, "strip", z.ZodTypeAny, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }>, "many">;
    returnScheduleId: z.ZodOptional<z.ZodNumber>;
    returnPassengers: z.ZodOptional<z.ZodArray<z.ZodObject<{
        seatNumber: z.ZodString;
        passengerName: z.ZodString;
        passengerPhone: z.ZodString;
        passengerEmail: z.ZodOptional<z.ZodString>;
        passengerIdNumber: z.ZodOptional<z.ZodString>;
        passengerAge: z.ZodOptional<z.ZodNumber>;
        passengerGender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    }, "strip", z.ZodTypeAny, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }, {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }>, "many">>;
    bookerName: z.ZodString;
    bookerPhone: z.ZodString;
    bookerEmail: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodEnum<["CASH", "ESEWA", "KHALTI", "IPS_CONNECT", "BANK", "MANUAL"]>>;
}, "strip", z.ZodTypeAny, {
    passengers: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[];
    scheduleId: number;
    bookerName: string;
    bookerPhone: string;
    returnScheduleId?: number | undefined;
    returnPassengers?: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[] | undefined;
    bookerEmail?: string | undefined;
    userId?: number | undefined;
    paymentMethod?: "ESEWA" | "KHALTI" | "IPS_CONNECT" | "BANK" | "CASH" | "MANUAL" | undefined;
}, {
    passengers: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[];
    scheduleId: number;
    bookerName: string;
    bookerPhone: string;
    returnScheduleId?: number | undefined;
    returnPassengers?: {
        seatNumber: string;
        passengerName: string;
        passengerPhone: string;
        passengerEmail?: string | undefined;
        passengerIdNumber?: string | undefined;
        passengerAge?: number | undefined;
        passengerGender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }[] | undefined;
    bookerEmail?: string | undefined;
    userId?: number | undefined;
    paymentMethod?: "ESEWA" | "KHALTI" | "IPS_CONNECT" | "BANK" | "CASH" | "MANUAL" | undefined;
}>;
export type AdminCreateBookingInput = z.infer<typeof adminCreateBookingSchema>;
export declare const reserveSeatsSchema: z.ZodObject<{
    scheduleId: z.ZodNumber;
    seatNumbers: z.ZodArray<z.ZodString, "many">;
    holdDuration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    scheduleId: number;
    seatNumbers: string[];
    holdDuration?: number | undefined;
}, {
    scheduleId: number;
    seatNumbers: string[];
    holdDuration?: number | undefined;
}>;
export type ReserveSeatsInput = z.infer<typeof reserveSeatsSchema>;
