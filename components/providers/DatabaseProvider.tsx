import { expoDb } from "@/db/client";
import { runMigrations } from "@/db/migrate";
import { seedDatabase } from "@/db/seed";
import { type PropsWithChildren, useEffect, useState } from "react";

/**
 * Runs DDL migrations (sync) then seeds default data (async) before
 * rendering any children. Keeps the splash screen up until ready.
 */
export function DatabaseProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Synchronous — creates tables before first query lands.
    runMigrations(expoDb);

    // Asynchronous — inserts seed rows only on first launch.
    seedDatabase()
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((e) => {
        console.error("[db] seed error:", e);
        if (mounted) setReady(true); // still open the app on seed failure
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;

  return <>{children}</>;
}
