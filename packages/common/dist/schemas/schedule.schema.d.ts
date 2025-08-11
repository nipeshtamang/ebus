import { z } from "zod";
export declare const createRouteSchema: z.ZodObject<{
    name: z.ZodString;
    origin: z.ZodString;
    destination: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    origin: string;
    destination: string;
}, {
    name: string;
    origin: string;
    destination: string;
}>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export declare const updateRouteSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    origin: z.ZodOptional<z.ZodString>;
    destination: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    origin?: string | undefined;
    destination?: string | undefined;
}, {
    name?: string | undefined;
    origin?: string | undefined;
    destination?: string | undefined;
}>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export declare const createBusSchema: z.ZodObject<{
    name: z.ZodString;
    layoutType: z.ZodString;
    seatCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    layoutType: string;
    seatCount: number;
}, {
    name: string;
    layoutType: string;
    seatCount: number;
}>;
export type CreateBusInput = z.infer<typeof createBusSchema>;
export declare const updateBusSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    layoutType: z.ZodOptional<z.ZodString>;
    seatCount: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    layoutType?: string | undefined;
    seatCount?: number | undefined;
}, {
    name?: string | undefined;
    layoutType?: string | undefined;
    seatCount?: number | undefined;
}>;
export type UpdateBusInput = z.infer<typeof updateBusSchema>;
export declare const createScheduleSchema: z.ZodObject<{
    routeId: z.ZodNumber;
    busId: z.ZodNumber;
    departure: z.ZodString;
    isReturn: z.ZodDefault<z.ZodBoolean>;
    fare: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    routeId: number;
    busId: number;
    departure: string;
    isReturn: boolean;
    fare: number;
}, {
    routeId: number;
    busId: number;
    departure: string;
    fare: number;
    isReturn?: boolean | undefined;
}>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export declare const updateScheduleSchema: z.ZodObject<{
    routeId: z.ZodOptional<z.ZodNumber>;
    busId: z.ZodOptional<z.ZodNumber>;
    departure: z.ZodOptional<z.ZodString>;
    isReturn: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    fare: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    routeId?: number | undefined;
    busId?: number | undefined;
    departure?: string | undefined;
    isReturn?: boolean | undefined;
    fare?: number | undefined;
}, {
    routeId?: number | undefined;
    busId?: number | undefined;
    departure?: string | undefined;
    isReturn?: boolean | undefined;
    fare?: number | undefined;
}>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
export declare const searchSchedulesSchema: z.ZodObject<{
    routeId: z.ZodOptional<z.ZodNumber>;
    origin: z.ZodOptional<z.ZodString>;
    destination: z.ZodOptional<z.ZodString>;
    departureDate: z.ZodOptional<z.ZodString>;
    isReturn: z.ZodEffects<z.ZodOptional<z.ZodBoolean>, boolean | undefined, unknown>;
}, "strip", z.ZodTypeAny, {
    origin?: string | undefined;
    destination?: string | undefined;
    departureDate?: string | undefined;
    routeId?: number | undefined;
    isReturn?: boolean | undefined;
}, {
    origin?: string | undefined;
    destination?: string | undefined;
    departureDate?: string | undefined;
    routeId?: number | undefined;
    isReturn?: unknown;
}>;
export type SearchSchedulesInput = z.infer<typeof searchSchedulesSchema>;
export declare const createBulkSchedulesSchema: z.ZodObject<{
    routeId: z.ZodNumber;
    busId: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
    departureTime: z.ZodString;
    daysOfWeek: z.ZodArray<z.ZodNumber, "many">;
    fare: z.ZodNumber;
    isReturn: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    routeId: number;
    busId: number;
    isReturn: boolean;
    fare: number;
    startDate: string;
    endDate: string;
    departureTime: string;
    daysOfWeek: number[];
}, {
    routeId: number;
    busId: number;
    fare: number;
    startDate: string;
    endDate: string;
    departureTime: string;
    daysOfWeek: number[];
    isReturn?: boolean | undefined;
}>;
export type CreateBulkSchedulesInput = z.infer<typeof createBulkSchedulesSchema>;
