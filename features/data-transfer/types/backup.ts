import type {
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

export const BACKUP_FORMAT = "gym-log-backup";
export const BACKUP_VERSION = 1;

export const BACKUP_COLLECTION_KEYS = [
  "gyms",
  "exercises",
  "routines",
  "routineExercises",
  "routineTags",
  "routineTagLinks",
  "entityTranslations",
  "workouts",
  "workoutExercises",
  "sets",
] as const;

export type BackupCollectionKey = (typeof BACKUP_COLLECTION_KEYS)[number];

export type BackupDataCollections = {
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

export type BackupCounts = Record<BackupCollectionKey, number>;

export type GymLogBackupFile = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  appVersion?: string;
  schemaVersion?: number;
  data: BackupDataCollections;
  counts: BackupCounts;
};

export type BackupIssueSeverity = "error" | "warning";

export type BackupIssue = {
  code: string;
  message: string;
  path?: string;
  severity: BackupIssueSeverity;
};

export type BackupCompatibilityResult = {
  status: "compatible" | "compatible-with-warnings" | "incompatible";
  issues: BackupIssue[];
  warnings: BackupIssue[];
  backupVersion: number | null;
  expectedVersion: number;
  backupSchemaVersion: number | null;
  appSchemaVersion: number | null;
};
