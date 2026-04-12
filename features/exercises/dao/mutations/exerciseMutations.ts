import { db } from "@/db/client";
import { exercises } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type CreateExerciseInput = {
  name: string;
  muscleGroup: string;
};

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export async function createCustomExercise(input: CreateExerciseInput): Promise<void> {
  const trimmedName = input.name.trim();
  const trimmedMuscleGroup = input.muscleGroup.trim();

  const existingExercise = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(eq(exercises.name, trimmedName))
    .limit(1);

  if (existingExercise.length > 0) {
    throw new Error("duplicate_exercise");
  }

  const searchValue = normalizeSearchText(`${trimmedName} ${trimmedMuscleGroup}`);

  await db.insert(exercises).values({
    id: `ex-custom-${Date.now()}`,
    name: trimmedName,
    muscleGroup: trimmedMuscleGroup,
    isCustom: true,
    searchPt: searchValue,
    searchEn: searchValue,
  });
}

export async function deleteCustomExercise(id: string): Promise<void> {
  await db.delete(exercises).where(and(eq(exercises.id, id), eq(exercises.isCustom, true)));
}
