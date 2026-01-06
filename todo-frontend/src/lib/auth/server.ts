import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email/send";
import { env } from "@/utils/env";

// Create a singleton pool to avoid multiple connections
let pool: Pool | null = null;


function getPool() {
  if (!pool) {
    const isProduction = env.NODE_ENV === "production";
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: env.DB_IDLE_TIMEOUT || 30000,
      connectionTimeoutMillis: env.DB_CONNECT_TIMEOUT || 10000,
      keepAlive: true,
      ssl: isProduction ? {
        rejectUnauthorized: false
      } : undefined
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }
  return pool;
}

// Initialize auth with auto-migration enabled
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BASE_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: getPool(),
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