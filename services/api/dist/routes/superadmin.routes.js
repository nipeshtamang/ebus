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
const express_1 = require("express");
const authenticateJWT_1 = require("../middleware/authenticateJWT");
const authorizeRoles_1 = require("../middleware/authorizeRoles");
const superadminController = __importStar(require("../controllers/superadmin.controller"));
const router = (0, express_1.Router)();
// All endpoints restricted to SUPERADMIN
router.use(authenticateJWT_1.authenticateJWT, (0, authorizeRoles_1.authorizeRoles)("SUPERADMIN"));
// Profile Management (self-update)
router.patch("/profile", superadminController.updateProfile);
// Dashboard Analytics
router.get("/dashboard/stats", superadminController.getDashboardStats);
router.get("/dashboard/recent-activity", superadminController.getRecentActivity);
// User Management
router.post("/users", superadminController.createUser);
router.get("/users", superadminController.getAllUsers);
router.get("/users/:userId", superadminController.getUserById);
router.patch("/users/:userId", superadminController.updateUser);
router.delete("/users/:userId", superadminController.deleteUser);
router.get("/users/:userId/tickets", superadminController.getUserTickets);
// System Management
router.post("/system/cleanup", superadminController.cleanupOrphanedBookings);
router.get("/system/logs", superadminController.getSystemLogs);
// System Health
router.get("/system/health", superadminController.getSystemHealth);
// Tickets Management
router.get("/tickets", superadminController.getTickets);
router.get("/tickets/:ticketId", superadminController.getTicketById);
router.patch("/tickets/:ticketId", superadminController.updateTicket);
router.delete("/tickets/:ticketId", superadminController.deleteTicket);
exports.default = router;
