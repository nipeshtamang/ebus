"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBulkSchedulesSchema = exports.searchSchedulesSchema = exports.updateScheduleSchema = exports.createScheduleSchema = exports.updateBusSchema = exports.createBusSchema = exports.updateRouteSchema = exports.createRouteSchema = void 0;
const zod_1 = require("zod");
// Route management
exports.createRouteSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Route name is required"),
    origin: zod_1.z.string().min(1, "Origin is required"),
    destination: zod_1.z.string().min(1, "Destination is required"),
});
exports.updateRouteSchema = exports.createRouteSchema.partial();
// Bus management
exports.createBusSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Bus name is required"),
    layoutType: zod_1.z.string().min(1, "Layout type is required"), // e.g., "2/1", "2/2"
    seatCount: zod_1.z.number().positive("Seat count must be positive"),
});
exports.updateBusSchema = exports.createBusSchema.partial();
// Schedule management
exports.createScheduleSchema = zod_1.z.object({
    routeId: zod_1.z.number().positive("Invalid route ID"),
    busId: zod_1.z.number().positive("Invalid bus ID"),
    departure: zod_1.z.string().min(1, "Departure date is required"),
    isReturn: zod_1.z.boolean().default(false),
    fare: zod_1.z.number().positive("Fare must be positive"),
});
exports.updateScheduleSchema = exports.createScheduleSchema.partial();
// Search schedules
exports.searchSchedulesSchema = zod_1.z.object({
    routeId: zod_1.z.number().positive("Invalid route ID").optional(),
    origin: zod_1.z.string().min(1, "Origin is required").optional(),
    destination: zod_1.z.string().min(1, "Destination is required").optional(),
    departureDate: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid departure date")
        .optional(),
    isReturn: zod_1.z.preprocess((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return val;
    }, zod_1.z.boolean().optional()),
});
// Bulk schedule creation
exports.createBulkSchedulesSchema = zod_1.z.object({
    routeId: zod_1.z.number().positive("Invalid route ID"),
    busId: zod_1.z.number().positive("Invalid bus ID"),
    startDate: zod_1.z.string().datetime("Invalid start date"),
    endDate: zod_1.z.string().datetime("Invalid end date"),
    departureTime: zod_1.z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    daysOfWeek: zod_1.z
        .array(zod_1.z.number().min(0).max(6))
        .min(1, "At least one day required"),
    fare: zod_1.z.number().positive("Fare must be positive"),
    isReturn: zod_1.z.boolean().default(false),
});
