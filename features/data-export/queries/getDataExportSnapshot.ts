import { db } from "@/db/client";
import {
  entityTranslations,
  exercises,
  gyms,
  routineExercises,
  routineTagLinks,
  routineTags,
  routines,
  sets,
  workoutExercises,
  workouts,
} from "@/db/schema";
import type { GymLogBackupFile } from "@/features/data-transfer/types/backup";

export type DataExportSnapshot = GymLogBackupFile;

export async function getDataExportSnapshot(): Promise<DataExportSnapshot> {
  const [
    gymRows,
    exerciseRows,
    routineRows,
    routineExerciseRows,
    routineTagRows,
    routineTagLinkRows,
    entityTranslationRows,
    workoutRows,
    workoutExerciseRows,
    setRows,
  ] = await Promise.all([
    db.select().from(gyms),
    db.select().from(exercises),
    db.select().from(routines),
    db.select().from(routineExercises),
    db.select().from(routineTags),
    db.select().from(routineTagLinks),
    db.select().from(entityTranslations),
    db.select().from(workouts),
    db.select().from(workoutExercises),
    db.select().from(sets),
  ]);

  return {
    format: "gym-log-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      gyms: gymRows,
      exercises: exerciseRows,
      routines: routineRows,
      routineExercises: routineExerciseRows,
      routineTags: routineTagRows,
      routineTagLinks: routineTagLinkRows,
      entityTranslations: entityTranslationRows,
      workouts: workoutRows,
      workoutExercises: workoutExerciseRows,
      sets: setRows,
    },
    counts: {
      gyms: gymRows.length,
      exercises: exerciseRows.length,
      routines: routineRows.length,
      routineExercises: routineExerciseRows.length,
      routineTags: routineTagRows.length,
      routineTagLinks: routineTagLinkRows.length,
      entityTranslations: entityTranslationRows.length,
      workouts: workoutRows.length,
      workoutExercises: workoutExerciseRows.length,
      sets: setRows.length,
    },
  };
}
