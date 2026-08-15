import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the Agent Offers Lab migration.");
}

const migrationUrl = new URL(
  "../docs/agent-offers-lab/migrations/001_events.sql",
  import.meta.url,
);
const migration = await readFile(migrationUrl, "utf8");
const statements = migration
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);
const sql = neon(databaseUrl);

for (const statement of statements) {
  await sql.query(statement);
}

console.info(`Applied ${statements.length} Agent Offers Lab migration statements.`);
