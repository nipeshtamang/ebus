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
const express_1 = require("express");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const fleetController = __importStar(require("../controllers/fleet.controller"));
const fleet_controller_1 = require("../controllers/fleet.controller");
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const router = (0, express_1.Router)();
// Public endpoints for getting routes and locations
router.get("/routes", fleetController.getAllRoutes);
router.get("/routes/:routeId", fleetController.getRouteById);
router.get("/locations", fleetController.getAllLocations);
// All endpoints restricted to SUPERADMIN
router.use(authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("SUPERADMIN"));
// Routes
router.post("/routes", fleetController.createRoute);
router.patch("/routes/:routeId", fleetController.updateRoute);
router.delete("/routes/:routeId", fleetController.deleteRoute);
// Buses
router.get("/buses", fleet_controller_1.getAllBuses);
router.post("/buses", fleetController.createBus);
router.patch("/buses/:busId", fleetController.updateBus);
router.delete("/buses/:busId", fleetController.deleteBus);
// Schedules
router.post("/schedules", fleetController.createSchedule);
router.patch("/schedules/:scheduleId", fleetController.updateSchedule);
router.delete("/schedules/:scheduleId", fleetController.deleteSchedule);
exports.default = router;
