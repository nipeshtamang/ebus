"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const schedule_controller_1 = require("../controllers/schedule.controller");
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const router = express_1.default.Router();
// Public routes
router.get("/search", schedule_controller_1.searchSchedules);
router.get("/:id", schedule_controller_1.getScheduleById);
// Protected routes
router.get("/", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.getAllSchedules);
router.post("/", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.createSchedule);
router.put("/:id", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.updateSchedule);
router.delete("/:id", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.deleteSchedule);
// Force delete route (cancels all bookings and reservations)
router.delete("/:id/force", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.forceDeleteSchedule);
// Utility route for regenerating seats
router.post("/:id/regenerate-seats", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), schedule_controller_1.regenerateSeats);
exports.default = router;
