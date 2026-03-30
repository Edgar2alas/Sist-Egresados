import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global { var _pgPool: Pool | undefined; }

const pool: Pool = global._pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
if (process.env.NODE_ENV !== "production") global._pgPool = pool;

export const db = drizzle(pool, { schema });
