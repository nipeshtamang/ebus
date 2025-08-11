import { createAdminSchema, loginSchema, registerSchema, sendOTPSchema, verifyOTPSchema, resetPasswordSchema, } from "@ebusewa/common";
import * as authService from "../services/auth.service";
import { sendOTP as sendOTPService, verifyOTP as verifyOTPService, } from "../services/email.service";
export async function register(req, res) {
    try {
        const { success, data, error } = registerSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        // All registrations are for CLIENT only; SUPERADMIN cannot be registered here
        const user = await authService.register(data);
        res.status(201).json({ id: user.id, name: user.name });
    }
    catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function login(req, res) {
    try {
        const { success, data, error } = loginSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const result = await authService.login(data);
        res.json(result);
    }
    catch (error) {
        console.error("Error in login:", error);
        // Always return a JSON error with a message field
        const status = error && typeof error === "object" && "status" in error
            ? error.status
            : 401;
        const message = error instanceof Error ? error.message : "Invalid credentials";
        res.status(status).json({ message });
    }
}
export async function createAdmin(req, res) {
    try {
        const { success, data, error } = createAdminSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const admin = await authService.createAdmin(data);
        res.status(201).json({ id: admin.id, name: admin.name });
    }
    catch (error) {
        console.error("Error in createAdmin:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function sendOTP(req, res) {
    try {
        const { success, data, error } = sendOTPSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        await sendOTPService(data);
        res.json({ message: "OTP sent successfully" });
    }
    catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({
            message: "Failed to send OTP",
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function verifyOTP(req, res) {
    try {
        const { success, data, error } = verifyOTPSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const isValid = await verifyOTPService(data);
        if (isValid) {
            res.json({ message: "OTP verified successfully" });
        }
        else {
            res.status(400).json({ message: "Invalid or expired OTP" });
        }
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({
            message: "Failed to verify OTP",
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function resetPassword(req, res) {
    try {
        const { success, data, error } = resetPasswordSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        await authService.resetPassword(data);
        res.json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        const status = error && typeof error === "object" && "status" in error
            ? error.status
            : 500;
        const message = error instanceof Error ? error.message : "Failed to reset password";
        res.status(status).json({ message });
    }
}
