import { Router } from "express";
import {
  createAdmin,
  login,
  register,
  sendOTP,
  verifyOTP,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";

const router = Router();

// OTP routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

// Protected: only SUPERADMIN can create admins
router.post(
  "/admin",
  authenticateJWT,
  authorizeRoles("SUPERADMIN"),
  createAdmin
);

export default router;
