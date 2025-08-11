import { z } from "zod";
import { Role } from "../types/role.enum";

// Client Registration (defaults to CLIENT role in database)
export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// Email OTP verification
export const sendOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
});
export type SendOTPInput = z.infer<typeof sendOTPSchema>;

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;

// Reset password after OTP verification
export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// SuperAdmin creates Admins
export const createAdminSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal(Role.ADMIN),
});
export type CreateAdminInput = z.infer<typeof createAdminSchema>;

// Login Schema for all users (CLIENT, ADMIN, SUPERADMIN)
export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phoneNumber: z
      .string()
      .regex(/^(\+?[1-9]\d{1,14})?$/, "Invalid phone number")
      .optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email", "phoneNumber"],
  });
export type LoginInput = z.infer<typeof loginSchema>;

// Google OAuth
export const googleAuthSchema = z.object({
  idToken: z.string(),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
