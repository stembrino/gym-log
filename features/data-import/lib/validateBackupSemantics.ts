import type { GymLogBackupFile } from "@/features/data-transfer/types/backup";

export type BackupSemanticValidationResult =
  | {
      status: "valid_backup";
    }
  | {
      status: "invalid_backup";
      issues: string[];
    };

function assertUnique(items: string[], label: string, issues: string[]) {
  const seen = new Set<string>();

  for (const key of items) {
    if (seen.has(key)) {
      issues.push(`Chave duplicada detectada em ${label}: ${key}`);
      continue;
    }

    seen.add(key);
  }
}

function checkForeignKey(
  args: {
    label: string;
    sourceKeys: string[];
    targetKeys: Set<string>;
    nullable?: boolean;
  },
  issues: string[],
) {
  const { label, sourceKeys, targetKeys, nullable = false } = args;

  for (const key of sourceKeys) {
    if (nullable && key.length === 0) {
      continue;
    }

    if (!targetKeys.has(key)) {
      issues.push(`Referência inválida em ${label}: ${key}`);
    }
  }
}

function checkCountMatches(
  label: keyof GymLogBackupFile["counts"],
  actual: number,
  expected: number,
  issues: string[],
) {
  if (actual !== expected) {
    issues.push(`Count divergente em ${label}: esperado=${expected}, atual=${actual}`);
  }
}

export function validateBackupSemantics(backup: GymLogBackupFile): BackupSemanticValidationResult {
  const issues: string[] = [];

  const gymIds = backup.data.gyms.map((row) => row.id);
  const exerciseIds = backup.data.exercises.map((row) => row.id);
  const routineIds = backup.data.routines.map((row) => row.id);
  const routineExerciseIds = backup.data.routineExercises.map((row) => row.id);
  const routineTagIds = backup.data.routineTags.map((row) => row.id);
  const workoutIds = backup.data.workouts.map((row) => row.id);
  const workoutExerciseIds = backup.data.workoutExercises.map((row) => row.id);
  const setIds = backup.data.sets.map((row) => row.id);

  assertUnique(gymIds, "gyms.id", issues);
  assertUnique(exerciseIds, "exercises.id", issues);
  assertUnique(routineIds, "routines.id", issues);
  assertUnique(routineExerciseIds, "routineExercises.id", issues);
  assertUnique(routineTagIds, "routineTags.id", issues);
  assertUnique(workoutIds, "workouts.id", issues);
  assertUnique(workoutExerciseIds, "workoutExercises.id", issues);
  assertUnique(setIds, "sets.id", issues);

  assertUnique(
    backup.data.routineTagLinks.map((row) => `${row.routineId}:${row.tagId}`),
    "routineTagLinks(routineId, tagId)",
    issues,
  );
  assertUnique(
    backup.data.entityTranslations.map(
      (row) => `${row.entityType}:${row.entityId}:${row.field}:${row.locale}`,
    ),
    "entityTranslations(entityType, entityId, field, locale)",
    issues,
  );

  const gymIdSet = new Set(gymIds);
  const exerciseIdSet = new Set(exerciseIds);
  const routineIdSet = new Set(routineIds);
  const routineTagIdSet = new Set(routineTagIds);
  const workoutIdSet = new Set(workoutIds);
  const workoutExerciseIdSet = new Set(workoutExerciseIds);

  checkForeignKey(
    {
      label: "workouts.gymId",
      sourceKeys: backup.data.workouts.map((row) => row.gymId ?? ""),
      targetKeys: gymIdSet,
      nullable: true,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "workouts.sourceRoutineId",
      sourceKeys: backup.data.workouts.map((row) => row.sourceRoutineId ?? ""),
      targetKeys: routineIdSet,
      nullable: true,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "workoutExercises.workoutId",
      sourceKeys: backup.data.workoutExercises.map((row) => row.workoutId),
      targetKeys: workoutIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "workoutExercises.exerciseId",
      sourceKeys: backup.data.workoutExercises.map((row) => row.exerciseId),
      targetKeys: exerciseIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "sets.workoutExerciseId",
      sourceKeys: backup.data.sets.map((row) => row.workoutExerciseId),
      targetKeys: workoutExerciseIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "routineExercises.routineId",
      sourceKeys: backup.data.routineExercises.map((row) => row.routineId),
      targetKeys: routineIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "routineExercises.exerciseId",
      sourceKeys: backup.data.routineExercises.map((row) => row.exerciseId),
      targetKeys: exerciseIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "routineTagLinks.routineId",
      sourceKeys: backup.data.routineTagLinks.map((row) => row.routineId),
      targetKeys: routineIdSet,
    },
    issues,
  );

  checkForeignKey(
    {
      label: "routineTagLinks.tagId",
      sourceKeys: backup.data.routineTagLinks.map((row) => row.tagId),
      targetKeys: routineTagIdSet,
    },
    issues,
  );

  const translationTargets = {
    exercise: exerciseIdSet,
    routine: routineIdSet,
    routine_tag: routineTagIdSet,
    gym: gymIdSet,
  } as const;

  for (const row of backup.data.entityTranslations) {
    const targetSet = translationTargets[row.entityType as keyof typeof translationTargets];

    if (!targetSet) {
      continue;
    }

    if (!targetSet.has(row.entityId)) {
      issues.push(
        `entityTranslations referencia ${row.entityType}:${row.entityId}, mas a entidade não existe no backup.`,
      );
    }
  }

  checkCountMatches("gyms", backup.data.gyms.length, backup.counts.gyms, issues);
  checkCountMatches("exercises", backup.data.exercises.length, backup.counts.exercises, issues);
  checkCountMatches("routines", backup.data.routines.length, backup.counts.routines, issues);
  checkCountMatches(
    "routineExercises",
    backup.data.routineExercises.length,
    backup.counts.routineExercises,
    issues,
  );
  checkCountMatches(
    "routineTags",
    backup.data.routineTags.length,
    backup.counts.routineTags,
    issues,
  );
  checkCountMatches(
    "routineTagLinks",
    backup.data.routineTagLinks.length,
    backup.counts.routineTagLinks,
    issues,
  );
  checkCountMatches(
    "entityTranslations",
    backup.data.entityTranslations.length,
    backup.counts.entityTranslations,
    issues,
  );
  checkCountMatches("workouts", backup.data.workouts.length, backup.counts.workouts, issues);
  checkCountMatches(
    "workoutExercises",
    backup.data.workoutExercises.length,
    backup.counts.workoutExercises,
    issues,
  );
  checkCountMatches("sets", backup.data.sets.length, backup.counts.sets, issues);

  if (issues.length > 0) {
    return {
      status: "invalid_backup",
      issues,
    };
  }

  return {
    status: "valid_backup",
  };
}
