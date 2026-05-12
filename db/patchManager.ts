import { db, expoDb } from "@/db/client";
import { runV1InitialSeedPatch } from "@/db/patches/v001_initial_seed";
import { runV2AddMachineBarbellExercisesPatch } from "@/db/patches/v002_add_machine_barbell_exercises";
import { runV3ReapplySystemExerciseTranslationsPatch } from "@/db/patches/v003_reapply_system_exercise_translations";
import { runV4ReseedRoutineTagsPatch } from "@/db/patches/v004_reseed_routine_tags";
import { dataPatches } from "@/db/schema";
import { eq } from "drizzle-orm";

type PatchDb = typeof db;

type DataPatch = {
  id: string;
  run: (database: PatchDb) => Promise<void>;
};

const PATCHES: DataPatch[] = [
  {
    id: "v001_initial_seed",
    run: runV1InitialSeedPatch,
  },
  {
    id: "v002_add_machine_barbell_exercises",
    run: runV2AddMachineBarbellExercisesPatch,
  },
  {
    id: "v003_reapply_system_exercise_translations",
    run: runV3ReapplySystemExerciseTranslationsPatch,
  },
  {
    id: "v004_reseed_routine_tags",
    run: runV4ReseedRoutineTagsPatch,
  },
];

function ensurePatchTable(): void {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS __data_patches (
      id          TEXT PRIMARY KEY NOT NULL,
      applied_at  TEXT NOT NULL
    );
  `);
}

export async function runDataPatches(): Promise<void> {
  ensurePatchTable();

  for (const patch of PATCHES) {
    const [existing] = await db
      .select({ id: dataPatches.id })
      .from(dataPatches)
      .where(eq(dataPatches.id, patch.id))
      .limit(1);

    if (existing) {
      continue;
    }

    await db.transaction(async (tx) => {
      await patch.run(tx as unknown as PatchDb);

      await tx.insert(dataPatches).values({
        id: patch.id,
        appliedAt: new Date().toISOString(),
      });
    });
  }
}
