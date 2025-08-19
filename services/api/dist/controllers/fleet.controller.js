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
exports.getAllRoutes = getAllRoutes;
exports.getRouteById = getRouteById;
exports.getAllLocations = getAllLocations;
exports.createRoute = createRoute;
exports.updateRoute = updateRoute;
exports.deleteRoute = deleteRoute;
exports.createBus = createBus;
exports.updateBus = updateBus;
exports.deleteBus = deleteBus;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.getAllBuses = getAllBuses;
const fleetService = __importStar(require("../services/fleet.service"));
// Public endpoints
async function getAllRoutes(req, res) {
    try {
        const routes = await fleetService.getAllRoutes();
        res.json(routes);
    }
    catch (error) {
        console.error("Error in getAllRoutes:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getRouteById(req, res) {
    try {
        const routeId = Number(req.params.routeId);
        if (isNaN(routeId)) {
            return res.status(400).json({ error: "Invalid route ID" });
        }
        const route = await fleetService.getRouteById(routeId);
        if (!route) {
            return res.status(404).json({ error: "Route not found" });
        }
        res.json(route);
    }
    catch (error) {
        console.error("Error in getRouteById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getAllLocations(req, res) {
    try {
        const locations = await fleetService.getAllLocations();
        res.json(locations);
    }
    catch (error) {
        console.error("Error in getAllLocations:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// Routes
async function createRoute(req, res) {
    try {
        const route = await fleetService.createRoute(req.body);
        res.status(201).json(route);
    }
    catch (error) {
        console.error("Error in createRoute:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateRoute(req, res) {
    try {
        const routeId = Number(req.params.routeId);
        if (isNaN(routeId)) {
            return res.status(400).json({ error: "Invalid route ID" });
        }
        const route = await fleetService.updateRoute(routeId, req.body);
        res.json(route);
    }
    catch (error) {
        console.error("Error in updateRoute:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteRoute(req, res) {
    try {
        const routeId = Number(req.params.routeId);
        if (isNaN(routeId)) {
            return res.status(400).json({ error: "Invalid route ID" });
        }
        await fleetService.deleteRoute(routeId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteRoute:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// Buses
async function createBus(req, res) {
    try {
        const bus = await fleetService.createBus(req.body);
        res.status(201).json(bus);
    }
    catch (error) {
        console.error("Error in createBus:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateBus(req, res) {
    try {
        const busId = Number(req.params.busId);
        if (isNaN(busId)) {
            return res.status(400).json({ error: "Invalid bus ID" });
        }
        const bus = await fleetService.updateBus(busId, req.body);
        res.json(bus);
    }
    catch (error) {
        console.error("Error in updateBus:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteBus(req, res) {
    try {
        const busId = Number(req.params.busId);
        if (isNaN(busId)) {
            return res.status(400).json({ error: "Invalid bus ID" });
        }
        await fleetService.deleteBus(busId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteBus:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// Schedules
async function createSchedule(req, res) {
    try {
        const schedule = await fleetService.createSchedule(req.body);
        res.status(201).json(schedule);
    }
    catch (error) {
        console.error("Error in createSchedule:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateSchedule(req, res) {
    try {
        const scheduleId = Number(req.params.scheduleId);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        const schedule = await fleetService.updateSchedule(scheduleId, req.body);
        res.json(schedule);
    }
    catch (error) {
        console.error("Error in updateSchedule:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteSchedule(req, res) {
    try {
        const scheduleId = Number(req.params.scheduleId);
        if (isNaN(scheduleId)) {
            return res.status(400).json({ error: "Invalid schedule ID" });
        }
        await fleetService.deleteSchedule(scheduleId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteSchedule:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getAllBuses(req, res) {
    try {
        const buses = await fleetService.getAllBuses();
        res.json(buses);
    }
    catch (error) {
        console.error("Error in getAllBuses:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
