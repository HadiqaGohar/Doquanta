import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import Database from "better-sqlite3";
import { Pool } from "pg";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email/send";
import { env } from "@/utils/env";
import path from "path";

// Initialize database based on environment
let databaseConfig: any;

if (env.DATABASE_URL && (env.DATABASE_URL.startsWith("postgres://") || env.DATABASE_URL.startsWith("postgresql://"))) {
  // Use Postgres in production
  databaseConfig = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes("vercel-storage.com") || env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
  });
} else {
  // Fallback to SQLite in development
  try {
    const dbPath = path.resolve(process.cwd(), "../todo-backend/todo.db");
    databaseConfig = new Database(dbPath);
  } catch (error) {
    console.error("Failed to initialize SQLite, using in-memory as last resort:", error);
    databaseConfig = new Database(":memory:");
  }
}

// Initialize auth
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: databaseConfig,
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