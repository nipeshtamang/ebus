"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
exports.deleteUser = deleteUser;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
const db_1 = require("../config/db");
const audit_service_1 = require("./audit.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function listUsers() {
    try {
        return await db_1.prisma.user.findMany();
    }
    catch (error) {
        console.error("Error in listUsers:", error);
        throw error;
    }
}
async function updateUserRole(userId, role) {
    try {
        const before = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!before) {
            throw new Error("User not found");
        }
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
        await (0, audit_service_1.logAudit)({
            userId,
            action: "UPDATE_ROLE",
            entity: "User",
            entityId: userId,
            before,
            after: user,
        });
        return user;
    }
    catch (error) {
        console.error("Error in updateUserRole:", error);
        throw error;
    }
}
async function deleteUser(userId) {
    try {
        const before = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!before) {
            throw new Error("User not found");
        }
        await db_1.prisma.user.delete({ where: { id: userId } });
        await (0, audit_service_1.logAudit)({
            userId,
            action: "DELETE_USER",
            entity: "User",
            entityId: userId,
            before,
        });
    }
    catch (error) {
        console.error("Error in deleteUser:", error);
        throw error;
    }
}
async function updateProfile(userId, data) {
    try {
        const before = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!before) {
            throw new Error("User not found");
        }
        // Check if phone number is being changed and if it's already taken
        if (data.phoneNumber && data.phoneNumber !== before.phoneNumber) {
            const existingUser = await db_1.prisma.user.findFirst({
                where: {
                    phoneNumber: data.phoneNumber,
                    id: { not: userId },
                },
            });
            if (existingUser) {
                throw new Error("Phone number is already in use");
            }
        }
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.phoneNumber)
            updateData.phoneNumber = data.phoneNumber;
        if (data.profileImage)
            updateData.profileImage = data.profileImage;
        const user = await db_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        await (0, audit_service_1.logAudit)({
            userId,
            action: "UPDATE_PROFILE",
            entity: "User",
            entityId: userId,
            before,
            after: user,
        });
        return user;
    }
    catch (error) {
        console.error("Error in updateProfile:", error);
        throw error;
    }
}
async function changePassword(userId, currentPassword, newPassword) {
    try {
        const user = await db_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        // Verify current password
        const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.passwordHash);
        if (!isValidPassword) {
            throw new Error("Current password is incorrect");
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 12);
        // Update password
        await db_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });
        await (0, audit_service_1.logAudit)({
            userId,
            action: "CHANGE_PASSWORD",
            entity: "User",
            entityId: userId,
            before: { passwordChanged: true },
            after: { passwordChanged: true },
        });
        return { message: "Password changed successfully" };
    }
    catch (error) {
        console.error("Error in changePassword:", error);
        throw error;
    }
}
