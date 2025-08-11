import { z } from "zod";

// Route management
export const createRouteSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
});
export type CreateRouteInput = z.infer<typeof createRouteSchema>;

export const updateRouteSchema = createRouteSchema.partial();
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

// Bus management
export const createBusSchema = z.object({
  name: z.string().min(1, "Bus name is required"),
  layoutType: z.string().min(1, "Layout type is required"), // e.g., "2/1", "2/2"
  seatCount: z.number().positive("Seat count must be positive"),
});
export type CreateBusInput = z.infer<typeof createBusSchema>;

export const updateBusSchema = createBusSchema.partial();
export type UpdateBusInput = z.infer<typeof updateBusSchema>;

// Schedule management
export const createScheduleSchema = z.object({
  routeId: z.number().positive("Invalid route ID"),
  busId: z.number().positive("Invalid bus ID"),
  departure: z.string().min(1, "Departure date is required"),
  isReturn: z.boolean().default(false),
  fare: z.number().positive("Fare must be positive"),
});
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema.partial();
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

// Search schedules
export const searchSchedulesSchema = z.object({
  routeId: z.number().positive("Invalid route ID").optional(),
  origin: z.string().min(1, "Origin is required").optional(),
  destination: z.string().min(1, "Destination is required").optional(),
  departureDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid departure date")
    .optional(),
  isReturn: z.preprocess((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return val;
  }, z.boolean().optional()),
});
export type SearchSchedulesInput = z.infer<typeof searchSchedulesSchema>;

// Bulk schedule creation
export const createBulkSchedulesSchema = z.object({
  routeId: z.number().positive("Invalid route ID"),
  busId: z.number().positive("Invalid bus ID"),
  startDate: z.string().datetime("Invalid start date"),
  endDate: z.string().datetime("Invalid end date"),
  departureTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  daysOfWeek: z
    .array(z.number().min(0).max(6))
    .min(1, "At least one day required"),
  fare: z.number().positive("Fare must be positive"),
  isReturn: z.boolean().default(false),
});
export type CreateBulkSchedulesInput = z.infer<
  typeof createBulkSchedulesSchema
>;
