import { z } from "zod";
const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(10),
    PORT: z.string().optional().default("3001"),
    // Email configuration
    SMTP_USER: z.string().email("Invalid SMTP user email"),
    SMTP_PASS: z.string().min(1, "SMTP password is required"),
    // Optional email settings
    SMTP_HOST: z.string().optional().default("smtp.gmail.com"),
    SMTP_PORT: z.string().optional().default("587"),
});
export const env = envSchema.parse(process.env);
