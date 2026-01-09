import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email/send";
import { env } from "@/utils/env";
import path from "path";

// Initialize SQLite database
// We place it in the todo-backend folder so both can potentially see the same data
const dbPath = path.resolve(process.cwd(), "../todo-backend/todo.db");
const db = new Database(dbPath);

// Initialize auth
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: db, // Use SQLite database instance
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: env.NODE_ENV === "production"
    },
  },
  trustedOrigins: [
    env.NEXT_PUBLIC_BASE_URL,
    "https://doquanta.vercel.app",
    "https://*.vercel.app"
  ],
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const emailSent = await sendVerificationEmail(user.email, url, user.name);
      if (!emailSent) {
        throw new Error("Failed to send email verification email");
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      const emailSent = await sendPasswordResetEmail(user.email, url, user.name);
      if (!emailSent) {
        throw new Error("Failed to send password reset email");
      }
    },
    resetPasswordTokenExpiresIn: 3600
  },
  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }
    } : {}),
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      }
    } : {}),
  },
  plugins: [
    nextCookies(),
    jwt(),
  ]
});

export const getSession = async (request: Request) => {
  return await auth.api.getSession({
    headers: request.headers,
  });
};