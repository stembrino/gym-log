import { DEFAULT_EXERCISES } from "@/db/patches/data/exercises";
import { entityTranslations } from "@/db/schema";
import type { db } from "@/db/client";
import { and, eq, inArray } from "drizzle-orm";

type PatchDb = typeof db;

export async function runV3ReapplySystemExerciseTranslationsPatch(
  database: PatchDb,
): Promise<void> {
  const timestamp = new Date().toISOString();
  const systemExerciseIds = DEFAULT_EXERCISES.map((exercise) => exercise.id);

  await database
    .delete(entityTranslations)
    .where(
      and(
        eq(entityTranslations.entityType, "exercise"),
        eq(entityTranslations.field, "name"),
        inArray(entityTranslations.entityId, systemExerciseIds),
      ),
    );

  await database
    .insert(entityTranslations)
    .values(
      DEFAULT_EXERCISES.flatMap((exercise) => [
        {
          entityType: "exercise" as const,
          entityId: exercise.id,
          field: "name" as const,
          locale: "pt-BR" as const,
          value: exercise.labelPt,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          entityType: "exercise" as const,
          entityId: exercise.id,
          field: "name" as const,
          locale: "en-US" as const,
          value: exercise.labelEn,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ]),
    )
    .onConflictDoNothing({
      target: [
        entityTranslations.entityType,
        entityTranslations.entityId,
        entityTranslations.field,
        entityTranslations.locale,
      ],
    });
}
