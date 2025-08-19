"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.createAdmin = createAdmin;
exports.resetPassword = resetPassword;
// import { CreateAdminInput, LoginInput, RegisterInput } from "@ebusewa/common";
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../config/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const audit_service_1 = require("./audit.service");
// export async function register(data: RegisterInput) {
//   const hash = await bcrypt.hash(data.password, 10);
//   return prisma.user.create({
//     data: { ...data, passwordHash: hash, role: "CLIENT" },
//   });
// }
async function register({ password, ...rest }) {
    try {
        const hash = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                ...rest, // includes name, email, and phoneNumber
                passwordHash: hash,
                role: "CLIENT", // Always CLIENT for public registration
            },
        });
        await (0, audit_service_1.logAudit)({
            userId: user.id,
            action: "REGISTER",
            entity: "User",
            entityId: user.id,
            after: user,
        });
        return user;
    }
    catch (error) {
        console.error("Error in register:", error);
        throw error;
    }
}
async function login(data) {
    try {
        let user;
        if (data.email) {
            user = await db_1.prisma.user.findUnique({ where: { email: data.email } });
        }
        else if (data.phoneNumber) {
            user = await db_1.prisma.user.findUnique({
                where: { phoneNumber: data.phoneNumber },
            });
        }
        if (!user)
            throw { status: 401, message: "Invalid credentials" };
        // Prevent login if email is not verified (only for CLIENT users)
        if (!user.emailVerified && user.role === "CLIENT") {
            throw {
                status: 401,
                message: "Please verify your email before logging in.",
            };
        }
        const valid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!valid)
            throw { status: 401, message: "Invalid credentials" };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        await (0, audit_service_1.logAudit)({
            userId: user.id,
            action: "LOGIN",
            entity: "User",
            entityId: user.id,
            after: { userId: user.id },
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                profileImage: user.profileImage,
            },
        };
    }
    catch (error) {
        console.error("Error in login:", error);
        throw error;
    }
}
async function createAdmin(data) {
    try {
        const hash = await bcrypt_1.default.hash(data.password, 10);
        const admin = await db_1.prisma.user.create({
            data: { ...data, passwordHash: hash, emailVerified: true },
        });
        await (0, audit_service_1.logAudit)({
            userId: admin.id,
            action: "CREATE_ADMIN",
            entity: "User",
            entityId: admin.id,
            after: admin,
        });
        return admin;
    }
    catch (error) {
        console.error("Error in createAdmin:", error);
        throw error;
    }
}
async function resetPassword(data) {
    try {
        // First verify the OTP
        const otpRecord = await db_1.prisma.emailOTP.findFirst({
            where: {
                email: data.email,
                otp: data.otp,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
        if (!otpRecord) {
            throw { status: 400, message: "Invalid or expired OTP" };
        }
        // Find the user by email
        const user = await db_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        // Hash the new password
        const newPasswordHash = await bcrypt_1.default.hash(data.newPassword, 10);
        // Update the user's password
        const updatedUser = await db_1.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newPasswordHash },
        });
        // Delete the used OTP
        await db_1.prisma.emailOTP.delete({
            where: { id: otpRecord.id },
        });
        // Log the password reset
        await (0, audit_service_1.logAudit)({
            userId: user.id,
            action: "RESET_PASSWORD",
            entity: "User",
            entityId: user.id,
            before: { userId: user.id },
            after: { userId: user.id },
        });
        return updatedUser;
    }
    catch (error) {
        console.error("Error in resetPassword:", error);
        throw error;
    }
}
