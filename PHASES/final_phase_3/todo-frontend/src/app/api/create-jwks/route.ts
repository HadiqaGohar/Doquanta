import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { env } from "@/utils/env";

export async function GET(request: NextRequest) {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
  });

  try {
    const client = await pool.connect();
    try {
      // Create jwks table
      await client.query(`
        CREATE TABLE IF NOT EXISTS jwks (
          id TEXT PRIMARY KEY,
          "publicKey" TEXT,
          "privateKey" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Ensure all columns exist (in case table existed but was incomplete)
      const columns = [
        'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "publicKey" TEXT',
        'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "privateKey" TEXT',
        'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
        'ALTER TABLE jwks ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP'
      ];
      
      for (const sql of columns) {
        await client.query(sql).catch(e => console.log("Column check note:", e.message));
      }

      return NextResponse.json({ message: "JWKS table checked/created successfully" });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error creating JWKS table:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await pool.end();
  }
}
