// import { CreateAdminInput, LoginInput, RegisterInput } from "@ebusewa/common";
import bcrypt from "bcrypt";
import { prisma } from "../config/db";
import jwt from "jsonwebtoken";
import {
  RegisterInput,
  LoginInput,
  CreateAdminInput,
  ResetPasswordInput,
} from "@ebusewa/common/src/schemas/auth.schema";
import { logAudit } from "./audit.service";

// export async function register(data: RegisterInput) {
//   const hash = await bcrypt.hash(data.password, 10);
//   return prisma.user.create({
//     data: { ...data, passwordHash: hash, role: "CLIENT" },
//   });
// }
export async function register({ password, ...rest }: RegisterInput) {
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        ...rest, // includes name, email, and phoneNumber
        passwordHash: hash,
        role: "CLIENT", // Always CLIENT for public registration
      },
    });
    await logAudit({
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
      after: user,
    });
    return user;
  } catch (error) {
    console.error("Error in register:", error);
    throw error;
  }
}

export async function login(data: LoginInput) {
  try {
    let user;
    if (data.email) {
      user = await prisma.user.findUnique({ where: { email: data.email } });
    } else if (data.phoneNumber) {
      user = await prisma.user.findUnique({
        where: { phoneNumber: data.phoneNumber },
      });
    }
    if (!user) throw { status: 401, message: "Invalid credentials" };

    // Prevent login if email is not verified (only for CLIENT users)
    if (!user.emailVerified && user.role === "CLIENT") {
      throw {
        status: 401,
        message: "Please verify your email before logging in.",
      };
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw { status: 401, message: "Invalid credentials" };

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    await logAudit({
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
  } catch (error) {
    console.error("Error in login:", error);
    throw error;
  }
}

export async function createAdmin(data: CreateAdminInput) {
  try {
    const hash = await bcrypt.hash(data.password, 10);
    const admin = await prisma.user.create({
      data: { ...data, passwordHash: hash, emailVerified: true },
    });
    await logAudit({
      userId: admin.id,
      action: "CREATE_ADMIN",
      entity: "User",
      entityId: admin.id,
      after: admin,
    });
    return admin;
  } catch (error) {
    console.error("Error in createAdmin:", error);
    throw error;
  }
}

export async function resetPassword(data: ResetPasswordInput) {
  try {
    // First verify the OTP
    const otpRecord = await prisma.emailOTP.findFirst({
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
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(data.newPassword, 10);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Delete the used OTP
    await prisma.emailOTP.delete({
      where: { id: otpRecord.id },
    });

    // Log the password reset
    await logAudit({
      userId: user.id,
      action: "RESET_PASSWORD",
      entity: "User",
      entityId: user.id,
      before: { userId: user.id },
      after: { userId: user.id },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
}
