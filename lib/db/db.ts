import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "dotenv";
import postgres from "postgres";
import * as schema from "./drizzle/schema";
config({ path: ".env" });
export const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({ client, schema });
