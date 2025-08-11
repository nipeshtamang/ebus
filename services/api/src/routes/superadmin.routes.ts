import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as superadminController from "../controllers/superadmin.controller";

const router = Router();

// All endpoints restricted to SUPERADMIN
router.use(authenticateJWT, authorizeRoles("SUPERADMIN"));

// Profile Management (self-update)
router.patch("/profile", superadminController.updateProfile);

// Dashboard Analytics
router.get("/dashboard/stats", superadminController.getDashboardStats);
router.get(
  "/dashboard/recent-activity",
  superadminController.getRecentActivity
);

// User Management
router.post("/users", superadminController.createUser);
router.get("/users", superadminController.getAllUsers);
router.get("/users/:userId", superadminController.getUserById);
router.patch("/users/:userId", superadminController.updateUser);
router.delete("/users/:userId", superadminController.deleteUser);
router.get("/users/:userId/tickets", superadminController.getUserTickets);

// System Management
router.post("/system/cleanup", superadminController.cleanupOrphanedBookings);
router.get("/system/logs", superadminController.getSystemLogs);

// System Health
router.get("/system/health", superadminController.getSystemHealth);

// Tickets Management
router.get("/tickets", superadminController.getTickets);
router.get("/tickets/:ticketId", superadminController.getTicketById);
router.patch("/tickets/:ticketId", superadminController.updateTicket);
router.delete("/tickets/:ticketId", superadminController.deleteTicket);

export default router;
