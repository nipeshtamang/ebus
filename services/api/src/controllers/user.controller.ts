import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { Role } from "@ebusewa/common";

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    role: string;
  };
}

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await userService.listUsers();
    res.json(users);
  } catch (error) {
    console.error("Error in listUsers:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required" });

    const user = await userService.updateUserRole(userId, role as Role);
    res.json(user);
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    await userService.deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    console.log("Update profile request received");
    console.log("Request user object:", req.user);

    const userId = (req as AuthenticatedRequest).user?.userId;
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
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    console.log("Change password request received");
    console.log("Request user object:", req.user);

    const userId = (req as AuthenticatedRequest).user?.userId;
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
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
