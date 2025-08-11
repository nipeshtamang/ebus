import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./db";

// Replace these with your real credentials
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0]?.value },
        });
        if (!user) {
          user = await prisma.user.create({
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
        await prisma.account.upsert({
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
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
