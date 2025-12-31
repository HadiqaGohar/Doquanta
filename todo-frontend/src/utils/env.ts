import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
        BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
        BETTER_AUTH_SECRET: z.string(),
        DATABASE_URL: z.string(),
        SMTP_HOST: z.string().default("smtp.gmail.com"),
        SMTP_USER: z.string(),
        SMTP_PASS: z.string(),

        DB_IDLE_TIMEOUT: z.number().default(30000),
        DB_CONNECT_TIMEOUT: z.number().default(2000),
        DB_QUERY_TIMEOUT: z.number().default(60000),

        GOOGLE_CLIENT_ID: z.string().optional(),
        GOOGLE_CLIENT_SECRET: z.string().optional(),
        GITHUB_CLIENT_ID: z.string().optional(),
        GITHUB_CLIENT_SECRET: z.string().optional(),
    },
    client: {
        NEXT_PUBLIC_BASE_URL: z.string().default("http://localhost:3000"),
        NEXT_PUBLIC_API_BASE_URL: z.string().default("http://localhost:8000"),
    },
    runtimeEnv: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS,
        DB_IDLE_TIMEOUT: process.env.DB_IDLE_TIMEOUT,
        DB_CONNECT_TIMEOUT: process.env.DB_CONNECT_TIMEOUT,
        DB_QUERY_TIMEOUT: process.env.DB_QUERY_TIMEOUT,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    },
});
