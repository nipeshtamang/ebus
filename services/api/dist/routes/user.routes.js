import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as userController from "../controllers/user.controller";
const router = Router();
// Profile management routes (for all authenticated users)
router.patch("/profile", authenticateJWT, userController.updateProfile);
router.patch("/change-password", authenticateJWT, userController.changePassword);
// Super admin only routes
router.use(authenticateJWT, authorizeRoles("SUPERADMIN"));
// List all users (Super-Admin only)
router.get("/", userController.listUsers);
// Update user role (Super-Admin only)
router.patch("/:userId/role", userController.updateUserRole);
// Delete user (Super-Admin only)
router.delete("/:userId", userController.deleteUser);
export default router;
