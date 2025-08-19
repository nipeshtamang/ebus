"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const booking_controller_1 = require("../controllers/booking.controller");
const router = (0, express_1.Router)();
router.use(authenticateJWT_1.authenticateJWT);
// Only CLIENT and ADMIN can view their own bookings
router.get("/me", (0, authorizeRoles_1.authorizeRoles)("CLIENT", "ADMIN"), booking_controller_1.getMyBookings);
// Admin endpoints - view all bookings and create bookings for users
router.get("/", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.getAllBookings);
router.get("/ticket/:ticketNumber", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.getBookingByTicketNumber);
router.get("/:id", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.getBookingById);
router.post("/admin", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.createBookingForUser);
// Development utility to reset seat status
router.post("/reset-seats/:scheduleId", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.resetSeatStatus);
// Development utility to cleanup orphaned bookings
router.post("/cleanup-orphaned", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.cleanupOrphanedBookings);
router.post("/", booking_controller_1.createBooking);
// Only CLIENT, ADMIN, or SUPERADMIN can cancel their own bookings (SUPERADMIN can cancel any)
router.delete("/:bookingId/cancel", (0, authorizeRoles_1.authorizeRoles)("CLIENT", "ADMIN", "SUPERADMIN"), booking_controller_1.cancelBooking);
// Admin booking management
router.patch("/:id/status", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.updateBookingStatus);
router.delete("/:bookingId/cancel-admin", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.adminCancelBooking);
// Remove a seat from a booking (admin)
router.delete("/:bookingId/seat/:seatNumber", (0, authorizeRoles_1.authorizeRoles)("ADMIN", "SUPERADMIN"), booking_controller_1.removeSeatFromBooking);
exports.default = router;
