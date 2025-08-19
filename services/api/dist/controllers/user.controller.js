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
exports.listUsers = listUsers;
exports.updateUserRole = updateUserRole;
exports.deleteUser = deleteUser;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
const userService = __importStar(require("../services/user.service"));
async function listUsers(req, res) {
    try {
        const users = await userService.listUsers();
        res.json(users);
    }
    catch (error) {
        console.error("Error in listUsers:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateUserRole(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const { role } = req.body;
        if (!role)
            return res.status(400).json({ error: "Role is required" });
        const user = await userService.updateUserRole(userId, role);
        res.json(user);
    }
    catch (error) {
        console.error("Error in updateUserRole:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteUser(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        await userService.deleteUser(userId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function updateProfile(req, res) {
    try {
        console.log("Update profile request received");
        console.log("Request user object:", req.user);
        const userId = req.user?.userId;
        console.log("Extracted userId:", userId);
        if (!userId) {
            console.error("No userId found in request");
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { name, phoneNumber, profileImage } = req.body;
        console.log("Update data:", {
            name,
            phoneNumber,
            hasImage: !!profileImage,
        });
        const updatedUser = await userService.updateProfile(userId, {
            name,
            phoneNumber,
            profileImage,
        });
        console.log("Profile updated successfully for user:", userId);
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function changePassword(req, res) {
    try {
        console.log("Change password request received");
        console.log("Request user object:", req.user);
        const userId = req.user?.userId;
        console.log("Extracted userId:", userId);
        if (!userId) {
            console.error("No userId found in request");
            return res.status(401).json({ error: "User not authenticated" });
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ error: "Current password and new password are required" });
        }
        await userService.changePassword(userId, currentPassword, newPassword);
        console.log("Password changed successfully for user:", userId);
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        console.error("Error changing password:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
