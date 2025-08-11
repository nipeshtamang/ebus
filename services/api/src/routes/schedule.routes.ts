import express from "express";
import {
  searchSchedules,
  getScheduleById,
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  regenerateSeats,
  forceDeleteSchedule,
} from "../controllers/schedule.controller";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";

const router = express.Router();

// Public routes
router.get("/search", searchSchedules);
router.get("/:id", getScheduleById);

// Protected routes
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  getAllSchedules
);
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  createSchedule
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  updateSchedule
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  deleteSchedule
);

// Force delete route (cancels all bookings and reservations)
router.delete(
  "/:id/force",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  forceDeleteSchedule
);

// Utility route for regenerating seats
router.post(
  "/:id/regenerate-seats",
  authenticateJWT,
  authorizeRoles("ADMIN", "SUPERADMIN"),
  regenerateSeats
);

export default router;
