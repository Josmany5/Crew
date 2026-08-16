import { defineConfig } from "drizzle-kit";
import path from "path";

// Load the repo-root .env so `drizzle-kit push` picks up DATABASE_URL.
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  // .env missing — fall through; drizzle-kit will report DATABASE_URL below.
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
