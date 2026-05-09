// Shared types for Gym Log backup files

export type GymLogBackupFile = {
  format: "gym-log-backup";
  version: number;
  exportedAt: string;
  appVersion?: string;
  schemaVersion?: number;
  data: {
    gyms: GymRow[];
    exercises: ExerciseRow[];
    routines: RoutineRow[];
    routineExercises: RoutineExerciseRow[];
    routineTags: RoutineTagRow[];
    routineTagLinks: RoutineTagLinkRow[];
    entityTranslations: EntityTranslationRow[];
    workouts: WorkoutRow[];
    workoutExercises: WorkoutExerciseRow[];
    sets: SetRow[];
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

// Example row types (replace with actual types from your schema)
export type GymRow = { id: string; name: string };
export type ExerciseRow = { id: string; name: string };
export type RoutineRow = { id: string; name: string };
export type RoutineExerciseRow = { id: string; routineId: string; exerciseId: string };
export type RoutineTagRow = { id: string; name: string };
export type RoutineTagLinkRow = { routineId: string; tagId: string };
export type EntityTranslationRow = { entityId: string; language: string; value: string };
export type WorkoutRow = { id: string; gymId: string | null; sourceRoutineId: string | null };
export type WorkoutExerciseRow = { id: string; workoutId: string; exerciseId: string };
export type SetRow = { id: string; workoutExerciseId: string; reps: number; weight: number };
