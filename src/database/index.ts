import { Pool } from "pg";
import { env } from "../config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const connectionString: string = env.DATABASE_URL || "";

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const pool = new Pool({
  connectionString: connectionString,
});

const database = drizzle({ client: pool, schema });

export default database;
export type Database = typeof database;
