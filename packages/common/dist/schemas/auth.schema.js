"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthSchema = exports.loginSchema = exports.createAdminSchema = exports.resetPasswordSchema = exports.verifyOTPSchema = exports.sendOTPSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const role_enum_1 = require("../types/role.enum");
// Client Registration (defaults to CLIENT role in database)
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    phoneNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
// Email OTP verification
exports.sendOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
});
exports.verifyOTPSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
});
// Reset password after OTP verification
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    newPassword: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
// SuperAdmin creates Admins
exports.createAdminSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters"),
    email: zod_1.z.string().email("Invalid email address"),
    phoneNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    role: zod_1.z.literal(role_enum_1.Role.ADMIN),
});
// Login Schema for all users (CLIENT, ADMIN, SUPERADMIN)
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email("Invalid email address").optional(),
    phoneNumber: zod_1.z
        .string()
        .regex(/^(\+?[1-9]\d{1,14})?$/, "Invalid phone number")
        .optional(),
    password: zod_1.z.string().min(1, "Password is required"),
})
    .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email", "phoneNumber"],
});
// Google OAuth
exports.googleAuthSchema = zod_1.z.object({
    idToken: zod_1.z.string(),
});
