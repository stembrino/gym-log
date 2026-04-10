import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

/** Raw expo-sqlite instance — passed to runMigrations(). */
export const expoDb = openDatabaseSync("lyte-log.db");

/** Drizzle ORM instance — use this everywhere for queries. */
export const db = drizzle(expoDb, { schema });
