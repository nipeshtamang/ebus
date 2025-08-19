"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const router = (0, express_1.Router)();
// OTP routes
router.post("/send-otp", auth_controller_1.sendOTP);
router.post("/verify-otp", auth_controller_1.verifyOTP);
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/reset-password", auth_controller_1.resetPassword);
// Protected: only SUPERADMIN can create admins
router.post("/admin", authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("SUPERADMIN"), auth_controller_1.createAdmin);
exports.default = router;
