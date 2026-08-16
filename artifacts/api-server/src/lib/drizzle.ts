import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@workspace/db/schema";
import { env } from "../config";

let _db: NodePgDatabase<typeof schema> | null = null;
let _pool: Pool | null = null;

export function pool(): Pool {
  if (_pool) return _pool;
  if (!env.databaseUrl) {
    throw new Error("DATABASE_URL is required (set it in .env)");
  }
  _pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  return _pool;
}

export function db(): NodePgDatabase<typeof schema> {
  if (_db) return _db;
  _db = drizzle(pool(), { schema });
  return _db;
}
