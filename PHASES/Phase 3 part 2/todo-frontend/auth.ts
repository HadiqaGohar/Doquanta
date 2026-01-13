import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
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

export const auth = betterAuth({
  database: getPool(),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BASE_URL,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    jwt(),
    nextCookies(),
  ],
});

export default auth;