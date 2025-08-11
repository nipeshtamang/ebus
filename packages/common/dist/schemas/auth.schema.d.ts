import { z } from "zod";
import { Role } from "../types/role.enum";
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phoneNumber: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
}, {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export declare const sendOTPSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export declare const verifyOTPSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    otp: string;
}, {
    email: string;
    otp: string;
}>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export declare const resetPasswordSchema: z.ZodObject<{
    email: z.ZodString;
    otp: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    otp: string;
    newPassword: string;
}, {
    email: string;
    otp: string;
    newPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export declare const createAdminSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phoneNumber: z.ZodString;
    password: z.ZodString;
    role: z.ZodLiteral<Role.ADMIN>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: Role.ADMIN;
}, {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: Role.ADMIN;
}>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export declare const loginSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phoneNumber?: string | undefined;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const googleAuthSchema: z.ZodObject<{
    idToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    idToken: string;
}, {
    idToken: string;
}>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
