import { validateBackupSemantics } from "../validateBackupSemantics";
import type { GymLogBackupFile } from "@/features/data-transfer/types/backup";

function createValidBackup(): GymLogBackupFile {
  return {
    format: "gym-log-backup",
    version: 1,
    exportedAt: "2026-05-08T10:00:00Z",
    data: {
      gyms: [],
      exercises: [],
      routines: [],
      routineExercises: [],
      routineTags: [],
      routineTagLinks: [],
      entityTranslations: [],
      workouts: [],
      workoutExercises: [],
      sets: [],
    },
    counts: {
      gyms: 0,
      exercises: 0,
      routines: 0,
      routineExercises: 0,
      routineTags: 0,
      routineTagLinks: 0,
      entityTranslations: 0,
      workouts: 0,
      workoutExercises: 0,
      sets: 0,
    },
  };
}

describe("validateBackupSemantics", () => {
  describe("valid backups", () => {
    it("should accept an empty backup with no data", () => {
      const backup = createValidBackup();

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });

    it("should accept backup with single gym", () => {
      const backup = createValidBackup();
      backup.data.gyms = [
        {
          id: "gym-1",
          name: "My Gym",
          isDefault: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.gyms = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });

    it("should accept backup with complete valid data structure", () => {
      const backup = createValidBackup();

      backup.data.gyms = [
        {
          id: "gym-1",
          name: "Gym A",
          isDefault: true,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];

      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench Press",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];

      backup.data.routines = [
        {
          id: "routine-1",
          name: "Push Day",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];

      backup.data.routineExercises = [
        {
          id: "re-1",
          routineId: "routine-1",
          exerciseId: "ex-1",
          exerciseOrder: 1,
          setsTarget: 3,
          repsTarget: "8-10",
        },
      ];

      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: "routine-1",
          gymId: "gym-1",
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];

      backup.data.workoutExercises = [
        {
          id: "we-1",
          workoutId: "w-1",
          exerciseId: "ex-1",
          exerciseOrder: 1,
        },
      ];

      backup.data.sets = [
        {
          id: "set-1",
          workoutExerciseId: "we-1",
          reps: 10,
          weight: 100,
          completed: true,
          timestamp: "2026-05-08T10:00:00Z",
        },
      ];

      backup.counts = {
        gyms: 1,
        exercises: 1,
        routines: 1,
        routineExercises: 1,
        routineTags: 0,
        routineTagLinks: 0,
        entityTranslations: 0,
        workouts: 1,
        workoutExercises: 1,
        sets: 1,
      };

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });
  });

  describe("primary key uniqueness", () => {
    it("should reject backup with duplicate gym IDs", () => {
      const backup = createValidBackup();
      backup.data.gyms = [
        { id: "gym-1", name: "Gym A", isDefault: true, createdAt: "2026-01-01T00:00:00Z" },
        { id: "gym-1", name: "Gym B", isDefault: false, createdAt: "2026-01-02T00:00:00Z" },
      ];
      backup.counts.gyms = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("Chave duplicada"))).toBe(true);
        expect(result.issues.some((issue) => issue.includes("gyms.id"))).toBe(true);
      }
    });

    it("should reject backup with duplicate exercise IDs", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench Press",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
        {
          id: "ex-1",
          name: "Squat",
          muscleGroup: "legs",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.counts.exercises = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("exercises.id"))).toBe(true);
      }
    });

    it("should reject backup with duplicate routine IDs", () => {
      const backup = createValidBackup();
      backup.data.routines = [
        {
          id: "r-1",
          name: "Push",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          id: "r-1",
          name: "Pull",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.routines = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routines.id"))).toBe(true);
      }
    });

    it("should reject backup with duplicate workout IDs", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
        {
          id: "w-1",
          date: "2026-05-09",
          status: "completed",
          duration: 45,
          notes: null,
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-09T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("workouts.id"))).toBe(true);
      }
    });

    it("should reject backup with duplicate set IDs", () => {
      const backup = createValidBackup();
      backup.data.sets = [
        {
          id: "set-1",
          workoutExerciseId: "we-1",
          reps: 10,
          weight: 100,
          completed: true,
          timestamp: "2026-05-08T10:00:00Z",
        },
        {
          id: "set-1",
          workoutExerciseId: "we-1",
          reps: 8,
          weight: 110,
          completed: true,
          timestamp: "2026-05-08T10:05:00Z",
        },
      ];
      backup.counts.sets = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("sets.id"))).toBe(true);
      }
    });
  });

  describe("composite key uniqueness", () => {
    it("should reject backup with duplicate routineTagLink composite keys", () => {
      const backup = createValidBackup();
      backup.data.routines = [
        {
          id: "r-1",
          name: "Push",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.data.routineTags = [
        {
          id: "tag-1",
          slug: "strength",
          searchPt: null,
          searchEn: null,
        },
      ];
      backup.data.routineTagLinks = [
        { routineId: "r-1", tagId: "tag-1" },
        { routineId: "r-1", tagId: "tag-1" },
      ];
      backup.counts.routines = 1;
      backup.counts.routineTags = 1;
      backup.counts.routineTagLinks = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(
          result.issues.some((issue) => issue.includes("routineTagLinks(routineId, tagId)")),
        ).toBe(true);
      }
    });

    it("should accept routineTagLinks with same routineId but different tags", () => {
      const backup = createValidBackup();
      backup.data.routines = [
        {
          id: "r-1",
          name: "Push",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.data.routineTags = [
        { id: "tag-1", slug: "strength", searchPt: null, searchEn: null },
        { id: "tag-2", slug: "endurance", searchPt: null, searchEn: null },
      ];
      backup.data.routineTagLinks = [
        { routineId: "r-1", tagId: "tag-1" },
        { routineId: "r-1", tagId: "tag-2" },
      ];
      backup.counts.routines = 1;
      backup.counts.routineTags = 2;
      backup.counts.routineTagLinks = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });

    it("should reject backup with duplicate entityTranslation composite keys", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.data.entityTranslations = [
        {
          entityType: "exercise",
          entityId: "ex-1",
          field: "name",
          locale: "pt-BR",
          value: "Supino",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        {
          entityType: "exercise",
          entityId: "ex-1",
          field: "name",
          locale: "pt-BR",
          value: "Supino 2",
          createdAt: "2026-01-02T00:00:00Z",
          updatedAt: "2026-01-02T00:00:00Z",
        },
      ];
      backup.counts.exercises = 1;
      backup.counts.entityTranslations = 2;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(
          result.issues.some((issue) =>
            issue.includes("entityTranslations(entityType, entityId, field, locale)"),
          ),
        ).toBe(true);
      }
    });
  });

  describe("foreign key constraints", () => {
    it("should reject workout with non-existent gym", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: null,
          gymId: "non-existent-gym",
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("workouts.gymId"))).toBe(true);
      }
    });

    it("should accept workout with null gym (nullable field)", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });

    it("should reject workout with non-existent source routine", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: "non-existent-routine",
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("workouts.sourceRoutineId"))).toBe(
          true,
        );
      }
    });

    it("should reject workoutExercise with non-existent workout", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.data.workoutExercises = [
        { id: "we-1", workoutId: "non-existent-workout", exerciseId: "ex-1", exerciseOrder: 1 },
      ];
      backup.counts.exercises = 1;
      backup.counts.workoutExercises = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("workoutExercises.workoutId"))).toBe(
          true,
        );
      }
    });

    it("should reject workoutExercise with non-existent exercise", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.data.workoutExercises = [
        { id: "we-1", workoutId: "w-1", exerciseId: "non-existent-ex", exerciseOrder: 1 },
      ];
      backup.counts.workouts = 1;
      backup.counts.workoutExercises = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("workoutExercises.exerciseId"))).toBe(
          true,
        );
      }
    });

    it("should reject set with non-existent workoutExercise", () => {
      const backup = createValidBackup();
      backup.data.sets = [
        {
          id: "set-1",
          workoutExerciseId: "non-existent-we",
          reps: 10,
          weight: 100,
          completed: true,
          timestamp: "2026-05-08T10:00:00Z",
        },
      ];
      backup.counts.sets = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("sets.workoutExerciseId"))).toBe(true);
      }
    });

    it("should reject routineExercise with non-existent routine", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.data.routineExercises = [
        {
          id: "re-1",
          routineId: "non-existent-r",
          exerciseId: "ex-1",
          exerciseOrder: 1,
          setsTarget: null,
          repsTarget: null,
        },
      ];
      backup.counts.exercises = 1;
      backup.counts.routineExercises = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routineExercises.routineId"))).toBe(
          true,
        );
      }
    });

    it("should reject routineExercise with non-existent exercise", () => {
      const backup = createValidBackup();
      backup.data.routines = [
        {
          id: "r-1",
          name: "Push",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.data.routineExercises = [
        {
          id: "re-1",
          routineId: "r-1",
          exerciseId: "non-existent-ex",
          exerciseOrder: 1,
          setsTarget: null,
          repsTarget: null,
        },
      ];
      backup.counts.routines = 1;
      backup.counts.routineExercises = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routineExercises.exerciseId"))).toBe(
          true,
        );
      }
    });

    it("should reject routineTagLink with non-existent routine", () => {
      const backup = createValidBackup();
      backup.data.routineTags = [{ id: "tag-1", slug: "strength", searchPt: null, searchEn: null }];
      backup.data.routineTagLinks = [{ routineId: "non-existent-r", tagId: "tag-1" }];
      backup.counts.routineTags = 1;
      backup.counts.routineTagLinks = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routineTagLinks.routineId"))).toBe(
          true,
        );
      }
    });

    it("should reject routineTagLink with non-existent tag", () => {
      const backup = createValidBackup();
      backup.data.routines = [
        {
          id: "r-1",
          name: "Push",
          detail: null,
          description: null,
          isSystem: false,
          isFavorite: false,
          searchPt: null,
          searchEn: null,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.data.routineTagLinks = [{ routineId: "r-1", tagId: "non-existent-tag" }];
      backup.counts.routines = 1;
      backup.counts.routineTagLinks = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routineTagLinks.tagId"))).toBe(true);
      }
    });
  });

  describe("translation references", () => {
    it("should reject translation referencing non-existent exercise", () => {
      const backup = createValidBackup();
      backup.data.entityTranslations = [
        {
          entityType: "exercise",
          entityId: "non-existent-ex",
          field: "name",
          locale: "pt-BR",
          value: "Supino",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.entityTranslations = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(
          result.issues.some(
            (issue) =>
              issue.includes("entityTranslations referencia") &&
              issue.includes("exercise:non-existent-ex"),
          ),
        ).toBe(true);
      }
    });

    it("should accept translation for valid exercise", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.data.entityTranslations = [
        {
          entityType: "exercise",
          entityId: "ex-1",
          field: "name",
          locale: "pt-BR",
          value: "Supino",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.exercises = 1;
      backup.counts.entityTranslations = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });

    it("should reject translation for non-existent routine", () => {
      const backup = createValidBackup();
      backup.data.entityTranslations = [
        {
          entityType: "routine",
          entityId: "non-existent-r",
          field: "name",
          locale: "pt-BR",
          value: "Dia de Peito",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.entityTranslations = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("routine:non-existent-r"))).toBe(true);
      }
    });

    it("should ignore translation for unknown entity type", () => {
      const backup = createValidBackup();
      backup.data.entityTranslations = [
        {
          entityType: "unknown_type",
          entityId: "unknown-id",
          field: "name",
          locale: "pt-BR",
          value: "Translation",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ];
      backup.counts.entityTranslations = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });
  });

  describe("count field validation", () => {
    it("should reject backup with mismatched gym count", () => {
      const backup = createValidBackup();
      backup.data.gyms = [
        { id: "gym-1", name: "Gym A", isDefault: true, createdAt: "2026-01-01T00:00:00Z" },
      ];
      backup.counts.gyms = 2; // Wrong count

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("Count divergente em gyms"))).toBe(
          true,
        );
      }
    });

    it("should reject backup with mismatched exercise count", () => {
      const backup = createValidBackup();
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.counts.exercises = 5; // Wrong count

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("Count divergente em exercises"))).toBe(
          true,
        );
      }
    });

    it("should reject backup with mismatched workout count", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 10; // Wrong count

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("Count divergente em workouts"))).toBe(
          true,
        );
      }
    });

    it("should reject backup with mismatched set count", () => {
      const backup = createValidBackup();
      backup.data.sets = [
        {
          id: "set-1",
          workoutExerciseId: "we-1",
          reps: 10,
          weight: 100,
          completed: true,
          timestamp: "2026-05-08T10:00:00Z",
        },
      ];
      backup.counts.sets = 100; // Wrong count

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.some((issue) => issue.includes("Count divergente em sets"))).toBe(
          true,
        );
      }
    });

    it("should accept backup with correct counts", () => {
      const backup = createValidBackup();
      backup.data.gyms = [
        { id: "gym-1", name: "Gym A", isDefault: true, createdAt: "2026-01-01T00:00:00Z" },
        { id: "gym-2", name: "Gym B", isDefault: false, createdAt: "2026-01-02T00:00:00Z" },
      ];
      backup.data.exercises = [
        {
          id: "ex-1",
          name: "Bench",
          muscleGroup: "chest",
          isCustom: false,
          searchPt: null,
          searchEn: null,
          imageUrl: null,
        },
      ];
      backup.counts.gyms = 2;
      backup.counts.exercises = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("valid_backup");
    });
  });

  describe("multiple issues accumulation", () => {
    it("should accumulate multiple validation issues", () => {
      const backup = createValidBackup();

      // Duplicate gym
      backup.data.gyms = [
        { id: "gym-1", name: "Gym A", isDefault: true, createdAt: "2026-01-01T00:00:00Z" },
        { id: "gym-1", name: "Gym B", isDefault: false, createdAt: "2026-01-02T00:00:00Z" },
      ];

      // Wrong count
      backup.counts.gyms = 5;

      // Invalid foreign key
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: null,
          sourceRoutineId: "non-existent-r",
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        },
      ];
      backup.counts.workouts = 1;

      const result = validateBackupSemantics(backup);

      expect(result.status).toBe("invalid_backup");
      if (result.status === "invalid_backup") {
        expect(result.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
