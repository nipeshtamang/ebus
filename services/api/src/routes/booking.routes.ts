import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  createBookingForUser,
  getBookingById,
  getBookingByTicketNumber,
  resetSeatStatus,
  cleanupOrphanedBookings,
  updateBookingStatus,
  adminCancelBooking,
  removeSeatFromBooking,
} from "../controllers/booking.controller";

const router = Router();
router.use(authenticateJWT);

// Only CLIENT and ADMIN can view their own bookings
router.get("/me", authorizeRoles("CLIENT", "ADMIN"), getMyBookings);

// Admin endpoints - view all bookings and create bookings for users
router.get("/", authorizeRoles("ADMIN", "SUPERADMIN"), getAllBookings);
router.get(
  "/ticket/:ticketNumber",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  getBookingByTicketNumber
);
router.get("/:id", authorizeRoles("ADMIN", "SUPERADMIN"), getBookingById);
router.post(
  "/admin",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  createBookingForUser
);

// Development utility to reset seat status
router.post(
  "/reset-seats/:scheduleId",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  resetSeatStatus
);

// Development utility to cleanup orphaned bookings
router.post(
  "/cleanup-orphaned",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  cleanupOrphanedBookings
);

router.post("/", createBooking);

// Only CLIENT, ADMIN, or SUPERADMIN can cancel their own bookings (SUPERADMIN can cancel any)
router.delete(
  "/:bookingId/cancel",
  authorizeRoles("CLIENT", "ADMIN", "SUPERADMIN"),
  cancelBooking
);

// Admin booking management
router.patch(
  "/:id/status",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  updateBookingStatus
);

router.delete(
  "/:bookingId/cancel-admin",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  adminCancelBooking
);

// Remove a seat from a booking (admin)
router.delete(
  "/:bookingId/seat/:seatNumber",
  authorizeRoles("ADMIN", "SUPERADMIN"),
  removeSeatFromBooking
);

export default router;
