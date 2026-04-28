import { DEFAULT_EXERCISES } from "@/db/patches/data/exercises";
import { entityTranslations, exercises } from "@/db/schema";
import type { db } from "@/db/client";

type PatchDb = typeof db;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildSearchIndex(exercise: { name: string; labelPt?: string; labelEn?: string }) {
  const ptLabel = exercise.labelPt ?? exercise.name;
  const enLabel = exercise.labelEn ?? exercise.name;

  return {
    searchPt: normalizeSearchText(`${ptLabel} ${exercise.name}`),
    searchEn: normalizeSearchText(`${enLabel} ${exercise.name}`),
  };
}

export async function runV2AddMachineBarbellExercisesPatch(database: PatchDb): Promise<void> {
  const timestamp = new Date().toISOString();

  await database
    .insert(exercises)
    .values(
      DEFAULT_EXERCISES.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        isCustom: exercise.isCustom,
        imageUrl: exercise.imageUrl ?? null,
        ...buildSearchIndex(exercise),
      })),
    )
    .onConflictDoNothing({ target: exercises.id });

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
