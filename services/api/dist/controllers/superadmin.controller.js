import { superadminService } from "../services/superadmin.service";
import { Role } from "@ebusewa/common";
// User Management
export async function createUser(req, res) {
    try {
        const { name, email, phoneNumber, password, role, profileImage } = req.body;
        // Validation
        if (!name || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                error: "All fields are required: name, email, phoneNumber, password, role",
            });
        }
        if (!Object.values(Role).includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Must be one of: SUPERADMIN, ADMIN, CLIENT",
            });
        }
        const user = await superadminService.createUser({
            name,
            email,
            phoneNumber,
            password,
            role,
            profileImage,
        });
        res.status(201).json(user);
    }
    catch (error) {
        console.error("Error in createUser:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getAllUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const result = await superadminService.listUsers(page, limit, search);
        res.json(result);
    }
    catch (error) {
        console.error("Error in getAllUsers:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getUserById(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const user = await superadminService.getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Error in getUserById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function updateUser(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const { name, email, phoneNumber, role, profileImage } = req.body;
        // Validation for role if provided
        if (role && !Object.values(Role).includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Must be one of: SUPERADMIN, ADMIN, CLIENT",
            });
        }
        const user = await superadminService.updateUser(userId, {
            name,
            email,
            phoneNumber,
            role,
            profileImage,
        });
        res.json(user);
    }
    catch (error) {
        console.error("Error in updateUser:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function deleteUser(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        await superadminService.deleteUser(userId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// Dashboard Analytics
export async function getDashboardStats(req, res) {
    try {
        const stats = await superadminService.getDashboardStats();
        res.json(stats);
    }
    catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// System Management
export async function cleanupOrphanedBookings(req, res) {
    try {
        const result = await superadminService.cleanupOrphanedBookings();
        res.json(result);
    }
    catch (error) {
        console.error("Error in cleanupOrphanedBookings:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getSystemLogs(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const dateFrom = req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined;
        const dateTo = req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined;
        const action = req.query.action;
        const entity = req.query.entity;
        const userId = req.query.userId
            ? parseInt(req.query.userId)
            : undefined;
        const result = await superadminService.getSystemLogs({
            page,
            limit,
            dateFrom,
            dateTo,
            action,
            entity,
            userId,
        });
        res.json(result);
    }
    catch (error) {
        console.error("Error in getSystemLogs:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getRecentActivity(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const activities = await superadminService.getRecentActivity(limit);
        res.json(activities);
    }
    catch (error) {
        console.error("Error in getRecentActivity:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getTickets(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const dateFrom = req.query.dateFrom
            ? new Date(req.query.dateFrom)
            : undefined;
        const dateTo = req.query.dateTo
            ? new Date(req.query.dateTo)
            : undefined;
        const routeId = req.query.routeId
            ? parseInt(req.query.routeId)
            : undefined;
        const userId = req.query.userId
            ? parseInt(req.query.userId)
            : undefined;
        const status = req.query.status;
        const result = await superadminService.getTickets({
            page,
            limit,
            dateFrom,
            dateTo,
            routeId,
            userId,
            status,
        });
        res.json(result);
    }
    catch (error) {
        console.error("Error in getTickets:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
// System Health
export async function getSystemHealth(req, res) {
    try {
        const health = await superadminService.getSystemHealth();
        res.json(health);
    }
    catch (error) {
        console.error("Error in getSystemHealth:", error);
        res.status(500).json({ error: "Failed to get system health" });
    }
}
// Ticket Management
export async function getTicketById(req, res) {
    try {
        const ticketId = Number(req.params.ticketId);
        if (isNaN(ticketId)) {
            return res.status(400).json({ error: "Invalid ticket ID" });
        }
        const ticket = await superadminService.getTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ error: "Ticket not found" });
        }
        res.json(ticket);
    }
    catch (error) {
        console.error("Error in getTicketById:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function updateTicket(req, res) {
    try {
        const ticketId = Number(req.params.ticketId);
        if (isNaN(ticketId)) {
            return res.status(400).json({ error: "Invalid ticket ID" });
        }
        const data = req.body;
        const updated = await superadminService.updateTicket(ticketId, data);
        res.json(updated);
    }
    catch (error) {
        console.error("Error in updateTicket:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function deleteTicket(req, res) {
    try {
        const ticketId = Number(req.params.ticketId);
        if (isNaN(ticketId)) {
            return res.status(400).json({ error: "Invalid ticket ID" });
        }
        await superadminService.deleteTicket(ticketId);
        res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteTicket:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function getUserTickets(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        const tickets = await superadminService.getUserTickets(userId);
        res.json(tickets);
    }
    catch (error) {
        console.error("Error in getUserTickets:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function updateProfile(req, res) {
    try {
        const userId = req.user.userId; // Get user ID from JWT token
        const { name, email, phoneNumber, profileImage } = req.body;
        // Validate required fields
        if (!name || !email || !phoneNumber) {
            return res.status(400).json({
                error: "Name, email, and phone number are required",
            });
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
            });
        }
        // Validate phone number format (basic validation)
        if (phoneNumber.length < 10) {
            return res.status(400).json({
                error: "Phone number must be at least 10 digits",
            });
        }
        // Validate profile image size if provided
        if (profileImage && profileImage.length > 5 * 1024 * 1024) {
            // 5MB limit
            return res.status(400).json({
                error: "Profile image is too large. Maximum size is 5MB",
            });
        }
        const user = await superadminService.updateProfile(userId, {
            name,
            email,
            phoneNumber,
            profileImage,
        });
        res.json(user);
    }
    catch (error) {
        console.error("Error in updateProfile:", error);
        res.status(400).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
