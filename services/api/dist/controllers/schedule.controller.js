"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchSchedules = searchSchedules;
exports.getScheduleById = getScheduleById;
exports.getAllSchedules = getAllSchedules;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.regenerateSeats = regenerateSeats;
exports.forceDeleteSchedule = forceDeleteSchedule;
const common_1 = require("@ebusewa/common");
const scheduleService = __importStar(require("../services/schedule.service"));
const common_2 = require("@ebusewa/common");
async function searchSchedules(req, res) {
    try {
        const { success, data, error } = common_1.searchSchedulesSchema.safeParse(req.query);
        if (!success)
            return res.status(400).json(error.flatten());
        // Check if we have origin and destination for direct search
        const { origin, destination, departureDate, returnDate, tripType, isReturn } = req.query;
        if (origin && destination && departureDate) {
            // Enhanced search logic for round-trip bookings
            if (tripType === 'roundtrip' && returnDate) {
                // Use enhanced search for round-trip
                const schedules = await scheduleService.searchSchedulesEnhanced(origin, destination, departureDate, returnDate, 'roundtrip');
                return res.json(schedules);
            }
            else {
                // Original logic for one-way or legacy searches
                const isReturnBool = String(isReturn) === "true";
                const schedules = await scheduleService.findSchedulesByOriginDestination(origin, destination, departureDate, isReturnBool);
                return res.json(schedules);
            }
        }
        const list = await scheduleService.findSchedules(data);
        res.json(list);
    }
    catch (error) {
        console.error("Error in searchSchedules:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getScheduleById(req, res) {
    try {
        const scheduleId = Number(req.params.id);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        const schedule = await scheduleService.getScheduleWithSeats(scheduleId);
        if (!schedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }
        res.json(schedule);
    }
    catch (error) {
        console.error("Error in getScheduleById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getAllSchedules(req, res) {
    try {
        const schedules = await scheduleService.getAllSchedules();
        res.json(schedules);
    }
    catch (error) {
        console.error("Error in getAllSchedules:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function createSchedule(req, res) {
    try {
        const { success, data, error } = common_2.createScheduleSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const schedule = await scheduleService.createSchedule(data);
        res.status(201).json(schedule);
    }
    catch (error) {
        console.error("Error in createSchedule:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateSchedule(req, res) {
    try {
        const scheduleId = Number(req.params.id);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        const { success, data, error } = common_2.updateScheduleSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const schedule = await scheduleService.updateSchedule(scheduleId, data);
        res.json(schedule);
    }
    catch (error) {
        console.error("Error in updateSchedule:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteSchedule(req, res) {
    try {
        const scheduleId = Number(req.params.id);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        await scheduleService.deleteSchedule(scheduleId);
        res.json({ message: "Schedule deleted successfully" });
    }
    catch (error) {
        console.error("Error in deleteSchedule:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function regenerateSeats(req, res) {
    try {
        const scheduleId = Number(req.params.id);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        const seatCount = await scheduleService.regenerateSeatsForSchedule(scheduleId);
        res.json({
            message: `Successfully regenerated ${seatCount} seats for schedule ${scheduleId}`,
            seatCount,
        });
    }
    catch (error) {
        console.error("Error in regenerateSeats:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function forceDeleteSchedule(req, res) {
    try {
        const scheduleId = Number(req.params.id);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        const result = await scheduleService.forceDeleteSchedule(scheduleId);
        res.json({
            message: result.message,
            details: {
                success: result.success,
                deletedSchedule: result.deletedSchedule,
            },
        });
    }
    catch (error) {
        console.error("Error in forceDeleteSchedule:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
