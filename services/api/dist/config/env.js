"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(10),
    PORT: zod_1.z.string().optional().default("3001"),
    // Email configuration
    SMTP_USER: zod_1.z.string().email("Invalid SMTP user email"),
    SMTP_PASS: zod_1.z.string().min(1, "SMTP password is required"),
    // Optional email settings
    SMTP_HOST: zod_1.z.string().optional().default("smtp.gmail.com"),
    SMTP_PORT: zod_1.z.string().optional().default("587"),
});
exports.env = envSchema.parse(process.env);
