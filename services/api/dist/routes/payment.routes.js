import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as paymentController from "../controllers/payment.controller";
const router = Router();
router.use(authenticateJWT);
// Payment history - accessible by ADMIN and SUPERADMIN
router.get("/", authorizeRoles("ADMIN", "SUPERADMIN"), paymentController.getPaymentHistory);
// Get payment by ID
router.get("/:id", authorizeRoles("ADMIN", "SUPERADMIN"), paymentController.getPaymentById);
// Process payment
router.post("/", authorizeRoles("ADMIN", "SUPERADMIN"), paymentController.processPayment);
// Refund payment
router.post("/:id/refund", authorizeRoles("ADMIN", "SUPERADMIN"), paymentController.refundPayment);
export default router;
