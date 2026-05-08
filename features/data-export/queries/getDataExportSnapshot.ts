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

export type DataExportSnapshot = {
  format: "gym-log-backup";
  version: 1;
  exportedAt: string;
  data: {
    gyms: (typeof gyms.$inferSelect)[];
    exercises: (typeof exercises.$inferSelect)[];
    routines: (typeof routines.$inferSelect)[];
    routineExercises: (typeof routineExercises.$inferSelect)[];
    routineTags: (typeof routineTags.$inferSelect)[];
    routineTagLinks: (typeof routineTagLinks.$inferSelect)[];
    entityTranslations: (typeof entityTranslations.$inferSelect)[];
    workouts: (typeof workouts.$inferSelect)[];
    workoutExercises: (typeof workoutExercises.$inferSelect)[];
    sets: (typeof sets.$inferSelect)[];
  };
  counts: {
    gyms: number;
    exercises: number;
    routines: number;
    routineExercises: number;
    routineTags: number;
    routineTagLinks: number;
    entityTranslations: number;
    workouts: number;
    workoutExercises: number;
    sets: number;
  };
};

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
