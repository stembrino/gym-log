import { validateBackupContract } from "../validateBackupContract";
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

describe("validateBackupContract", () => {
  describe("valid contracts", () => {
    it("should accept a valid backup with all required fields and empty collections", () => {
      const backup = createValidBackup();
      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
      if (result.status === "valid_contract") {
        expect(result.backup).toEqual(backup);
      }
    });

    it("should accept a valid backup with data in collections", () => {
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

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
      if (result.status === "valid_contract") {
        expect(result.backup.data.gyms).toHaveLength(1);
      }
    });

    it("should accept a valid backup with optional metadata fields", () => {
      const backup = createValidBackup();
      backup.appVersion = "1.0.0";
      backup.schemaVersion = 1;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });
  });

  describe("invalid input types", () => {
    it("should reject null input", () => {
      const result = validateBackupContract(null);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });

    it("should reject array input", () => {
      const result = validateBackupContract([]);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });

    it("should reject string input", () => {
      const result = validateBackupContract("not an object");

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });

    it("should reject number input", () => {
      const result = validateBackupContract(42);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });

    it("should reject boolean input", () => {
      const result = validateBackupContract(true);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });

    it("should reject undefined input", () => {
      const result = validateBackupContract(undefined);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Payload deve ser um objeto JSON.");
      }
    });
  });

  describe("format field validation", () => {
    it("should reject backup with wrong format value", () => {
      const backup = createValidBackup();
      (backup as any).format = "wrong-format";

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo format inválido.");
      }
    });

    it("should reject backup with missing format field", () => {
      const backup = createValidBackup();
      delete (backup as any).format;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo format inválido.");
      }
    });

    it("should reject backup with null format", () => {
      const backup = createValidBackup();
      (backup as any).format = null;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo format inválido.");
      }
    });
  });

  describe("version field validation", () => {
    it("should reject backup with missing version field", () => {
      const backup = createValidBackup();
      delete (backup as any).version;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo version ausente ou inválido.");
      }
    });

    it("should reject backup with non-numeric version", () => {
      const backup = createValidBackup();
      (backup as any).version = "1.0";

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo version ausente ou inválido.");
      }
    });

    it("should reject backup with null version", () => {
      const backup = createValidBackup();
      (backup as any).version = null;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo version ausente ou inválido.");
      }
    });

    it("should accept backup with numeric version (different values)", () => {
      const backup = createValidBackup();
      (backup as any).version = 2;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });
  });

  describe("exportedAt field validation", () => {
    it("should reject backup with missing exportedAt field", () => {
      const backup = createValidBackup();
      delete (backup as any).exportedAt;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo exportedAt ausente ou inválido.");
      }
    });

    it("should reject backup with non-string exportedAt", () => {
      const backup = createValidBackup();
      (backup as any).exportedAt = 12345;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo exportedAt ausente ou inválido.");
      }
    });

    it("should reject backup with null exportedAt", () => {
      const backup = createValidBackup();
      (backup as any).exportedAt = null;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo exportedAt ausente ou inválido.");
      }
    });

    it("should accept backup with any string as exportedAt", () => {
      const backup = createValidBackup();
      (backup as any).exportedAt = "any-string-value";

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });
  });

  describe("data field validation", () => {
    it("should reject backup with missing data field", () => {
      const backup = createValidBackup();
      delete (backup as any).data;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo data ausente ou inválido.");
      }
    });

    it("should reject backup with null data", () => {
      const backup = createValidBackup();
      (backup as any).data = null;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo data ausente ou inválido.");
      }
    });

    it("should reject backup with array as data", () => {
      const backup = createValidBackup();
      (backup as any).data = [];

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo data ausente ou inválido.");
      }
    });

    it("should reject backup with string as data", () => {
      const backup = createValidBackup();
      (backup as any).data = "not an object";

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo data ausente ou inválido.");
      }
    });
  });

  describe("counts field validation", () => {
    it("should reject backup with missing counts field", () => {
      const backup = createValidBackup();
      delete (backup as any).counts;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo counts ausente ou inválido.");
      }
    });

    it("should reject backup with null counts", () => {
      const backup = createValidBackup();
      (backup as any).counts = null;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo counts ausente ou inválido.");
      }
    });

    it("should reject backup with array as counts", () => {
      const backup = createValidBackup();
      (backup as any).counts = [];

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo counts ausente ou inválido.");
      }
    });

    it("should reject backup with non-numeric count values", () => {
      const backup = createValidBackup();
      (backup as any).counts = {
        gyms: "not a number",
        exercises: 0,
      };

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues).toContain("Campo counts ausente ou inválido.");
      }
    });

    it("should accept backup with valid numeric counts", () => {
      const backup = createValidBackup();
      backup.counts = {
        gyms: 5,
        exercises: 10,
        routines: 3,
        routineExercises: 15,
        routineTags: 2,
        routineTagLinks: 6,
        entityTranslations: 50,
        workouts: 100,
        workoutExercises: 200,
        sets: 1000,
      };

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });
  });

  describe("collection validation", () => {
    it("should reject backup with missing gym collection", () => {
      const backup = createValidBackup();
      delete (backup.data as any).gyms;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues.some((issue) => issue.includes("Coleções ausentes"))).toBe(true);
        expect(result.issues.some((issue) => issue.includes("gyms"))).toBe(true);
      }
    });

    it("should reject backup with non-array collection", () => {
      const backup = createValidBackup();
      (backup.data as any).exercises = { id: "1" };

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues.some((issue) => issue.includes("Coleções ausentes"))).toBe(true);
      }
    });

    it("should reject backup missing multiple collections", () => {
      const backup = createValidBackup();
      delete (backup.data as any).gyms;
      delete (backup.data as any).exercises;
      delete (backup.data as any).routines;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        const collectionIssue = result.issues.find((issue) => issue.includes("Coleções ausentes"));
        expect(collectionIssue).toBeDefined();
        expect(collectionIssue).toContain("gyms");
        expect(collectionIssue).toContain("exercises");
        expect(collectionIssue).toContain("routines");
      }
    });

    it("should accept backup with all required collections as empty arrays", () => {
      const backup = createValidBackup();

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });
  });

  describe("multiple field validation", () => {
    it("should accumulate multiple validation issues", () => {
      const backup: any = {
        format: "wrong-format",
        version: "not-a-number",
        exportedAt: 12345,
        data: null,
        counts: "not-an-object",
      };

      const result = validateBackupContract(backup);

      expect(result.status).toBe("invalid_contract");
      if (result.status === "invalid_contract") {
        expect(result.issues.length).toBeGreaterThanOrEqual(4);
        expect(result.issues).toContain("Campo format inválido.");
        expect(result.issues).toContain("Campo version ausente ou inválido.");
        expect(result.issues).toContain("Campo exportedAt ausente ou inválido.");
        expect(result.issues).toContain("Campo data ausente ou inválido.");
        expect(result.issues).toContain("Campo counts ausente ou inválido.");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle backup object with extra unknown fields", () => {
      const backup = createValidBackup();
      (backup as any).extraField = "some value";
      (backup as any).anotherExtraField = 123;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });

    it("should handle deeply nested structure", () => {
      const backup = createValidBackup();
      backup.data.workouts = [
        {
          id: "w-1",
          date: "2026-05-08",
          status: "completed",
          duration: 60,
          notes: "Good session",
          sourceRoutineId: null,
          gymId: null,
          createdAt: "2026-05-08T10:00:00Z",
          deletedAt: null,
        } as any,
      ];
      backup.counts.workouts = 1;

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
    });

    it("should return the exact input as backup when validation succeeds", () => {
      const backup = createValidBackup();

      const result = validateBackupContract(backup);

      expect(result.status).toBe("valid_contract");
      if (result.status === "valid_contract") {
        expect(result.backup === backup).toBe(true);
      }
    });
  });
});
