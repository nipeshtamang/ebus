import { prisma } from "../config/db";
import { logAudit } from "./audit.service";
import { Role } from "@ebusewa/common";
import bcrypt from "bcrypt";

interface UpdateProfileData {
  name?: string;
  phoneNumber?: string;
  profileImage?: string;
}

export async function listUsers() {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.error("Error in listUsers:", error);
    throw error;
  }
}

export async function updateUserRole(userId: number, role: Role) {
  try {
    const before = await prisma.user.findUnique({ where: { id: userId } });

    if (!before) {
      throw new Error("User not found");
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await logAudit({
      userId,
      action: "UPDATE_ROLE",
      entity: "User",
      entityId: userId,
      before,
      after: user,
    });

    return user;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    throw error;
  }
}

export async function deleteUser(userId: number) {
  try {
    const before = await prisma.user.findUnique({ where: { id: userId } });

    if (!before) {
      throw new Error("User not found");
    }

    await prisma.user.delete({ where: { id: userId } });

    await logAudit({
      userId,
      action: "DELETE_USER",
      entity: "User",
      entityId: userId,
      before,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
}

export async function updateProfile(userId: number, data: UpdateProfileData) {
  try {
    const before = await prisma.user.findUnique({ where: { id: userId } });

    if (!before) {
      throw new Error("User not found");
    }

    // Check if phone number is being changed and if it's already taken
    if (data.phoneNumber && data.phoneNumber !== before.phoneNumber) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new Error("Phone number is already in use");
      }
    }

    const updateData: Partial<UpdateProfileData> = {};
    if (data.name) updateData.name = data.name;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.profileImage) updateData.profileImage = data.profileImage;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await logAudit({
      userId,
      action: "UPDATE_PROFILE",
      entity: "User",
      entityId: userId,
      before,
      after: user,
    });

    return user;
  } catch (error) {
    console.error("Error in updateProfile:", error);
    throw error;
  }
}

export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await logAudit({
      userId,
      action: "CHANGE_PASSWORD",
      entity: "User",
      entityId: userId,
      before: { passwordChanged: true },
      after: { passwordChanged: true },
    });

    return { message: "Password changed successfully" };
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw error;
  }
}
