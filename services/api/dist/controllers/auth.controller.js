"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.createAdmin = createAdmin;
exports.sendOTP = sendOTP;
exports.verifyOTP = verifyOTP;
exports.resetPassword = resetPassword;
const common_1 = require("@ebusewa/common");
const authService = __importStar(require("../services/auth.service"));
const email_service_1 = require("../services/email.service");
async function register(req, res) {
    try {
        const { success, data, error } = common_1.registerSchema.safeParse(req.body);
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
async function login(req, res) {
    try {
        const { success, data, error } = common_1.loginSchema.safeParse(req.body);
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
async function createAdmin(req, res) {
    try {
        const { success, data, error } = common_1.createAdminSchema.safeParse(req.body);
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
async function sendOTP(req, res) {
    try {
        const { success, data, error } = common_1.sendOTPSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        await (0, email_service_1.sendOTP)(data);
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
async function verifyOTP(req, res) {
    try {
        const { success, data, error } = common_1.verifyOTPSchema.safeParse(req.body);
        if (!success)
            return res.status(400).json(error.flatten());
        const isValid = await (0, email_service_1.verifyOTP)(data);
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
async function resetPassword(req, res) {
    try {
        const { success, data, error } = common_1.resetPasswordSchema.safeParse(req.body);
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
