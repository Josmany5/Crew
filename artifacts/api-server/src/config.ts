import dotenv from "dotenv";
import path from "node:path";

// Load the repo-root .env (runs from artifacts/api-server/dist at runtime).
dotenv.config({
  path: path.resolve(import.meta.dirname, "../../../.env"),
});

export const env = {
  port: Number(process.env.PORT ?? 5000),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
};
