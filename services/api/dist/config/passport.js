"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("./db");
// Replace these with your real credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await db_1.prisma.user.findUnique({
            where: { email: profile.emails?.[0]?.value },
        });
        if (!user) {
            user = await db_1.prisma.user.create({
                data: {
                    name: profile.displayName || "Google User",
                    email: profile.emails?.[0]?.value || "",
                    emailVerified: true,
                    phoneNumber: "google-oauth-" + profile.id, // Placeholder
                    passwordHash: "google-oauth", // Placeholder
                    role: "CLIENT",
                },
            });
        }
        // Create or update Account
        await db_1.prisma.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: "google",
                    providerAccountId: profile.id,
                },
            },
            update: {
                accessToken,
                refreshToken,
            },
            create: {
                userId: user.id,
                provider: "google",
                providerAccountId: profile.id,
                accessToken,
                refreshToken,
            },
        });
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await db_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err);
    }
});
exports.default = passport_1.default;
