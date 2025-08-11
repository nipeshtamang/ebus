import { Router } from "express";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as adminController from "../controllers/admin.controller";
const router = Router();
// All endpoints restricted to ADMIN and SUPERADMIN
router.use(authorizeRoles("ADMIN", "SUPERADMIN"));
// Dashboards
router.get("/dashboard/revenue", adminController.revenueTrends);
router.get("/dashboard/seat-utilization", adminController.seatUtilization);
router.get("/dashboard/cancellations", adminController.cancellationStats);
router.get("/dashboard/reservation-holds", adminController.reservationHoldAnalytics);
// Audit log viewing
router.get("/audit-logs", adminController.listAuditLogs);
export default router;
