import { neon } from "@neondatabase/serverless";

export interface DatabaseClient {
  query<Row extends Record<string, unknown>>(
    sql: string,
    params?: readonly unknown[],
  ): Promise<Row[]>;
}

interface DatabaseClientOptions {
  timeoutMs?: number;
}

const DEFAULT_QUERY_TIMEOUT_MS = 1_500;

export function createNeonDatabaseClient(
  databaseUrl: string,
  options: DatabaseClientOptions = {},
): DatabaseClient {
  const sql = neon(databaseUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_QUERY_TIMEOUT_MS;

  return {
    async query<Row extends Record<string, unknown>>(
      queryText: string,
      params: readonly unknown[] = [],
    ): Promise<Row[]> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const rows = await sql.query(queryText, [...params], {
          fetchOptions: { signal: controller.signal },
        });
        return rows as Row[];
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

let cachedDatabaseUrl: string | null = null;
let cachedClient: DatabaseClient | null = null;

export function getDatabaseClient(): DatabaseClient | null {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

  if (!databaseUrl) {
    return null;
  }

  if (cachedClient && cachedDatabaseUrl === databaseUrl) {
    return cachedClient;
  }

  cachedDatabaseUrl = databaseUrl;
  cachedClient = createNeonDatabaseClient(databaseUrl);
  return cachedClient;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
