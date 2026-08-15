import { readFile, readdir } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run the Agent Offers Lab migration.");
}

const migrationsUrl = new URL(
  "../docs/agent-offers-lab/migrations/",
  import.meta.url,
);
const migrationFiles = (await readdir(migrationsUrl))
  .filter((fileName) => /^\d+_.+\.sql$/.test(fileName))
  .sort();
const sql = neon(databaseUrl);
let statementCount = 0;

for (const migrationFile of migrationFiles) {
  const migration = await readFile(new URL(migrationFile, migrationsUrl), "utf8");
  const statements = migration
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
    statementCount += 1;
  }
}

console.info(
  `Applied ${statementCount} telemetry migration statements from ${migrationFiles.length} files.`,
);
