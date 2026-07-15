import { defineConfig } from "drizzle-kit";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: connectionString },
});
