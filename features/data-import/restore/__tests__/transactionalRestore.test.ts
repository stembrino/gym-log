import { transactionalRestore } from "../transactionalRestore";
import type { GymLogBackupFile } from "@/features/data-transfer/types/backup";
import { db } from "@/db/client";

jest.mock("@/db/client", () => ({
  db: {
    transaction: jest.fn(),
  },
}));

type MockTrx = {
  delete: jest.Mock<Promise<void>, [unknown]>;
  insert: jest.Mock<{ values: jest.Mock<Promise<void>, [unknown[]]> }, [unknown]>;
};

function createBackup(): GymLogBackupFile {
  return {
    format: "gym-log-backup",
    version: 1,
    exportedAt: "2026-05-09T22:53:13.153Z",
    data: {
      gyms: [],
      exercises: [
        {
          id: "ex-01-chest",
          name: "Bench Press",
          muscleGroup: "Chest",
          isCustom: false,
          searchPt: "supino reto bench press",
          searchEn: "bench press bench press",
          imageUrl: "@assets/images/avatars/supino.webp",
        },
      ],
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
      exercises: 1,
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

describe("transactionalRestore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not call values() with empty arrays", async () => {
    const valuesArgs: unknown[][] = [];

    const trx: MockTrx = {
      delete: jest.fn().mockResolvedValue(undefined),
      insert: jest.fn().mockImplementation(() => ({
        values: jest.fn().mockImplementation(async (rows: unknown[]) => {
          valuesArgs.push(rows);
        }),
      })),
    };

    (db.transaction as jest.Mock).mockImplementation(async (callback: (tx: MockTrx) => unknown) => {
      await callback(trx);
    });

    const backup = createBackup();
    const result = await transactionalRestore(backup);

    expect(result.status).toBe("success");
    expect(db.transaction).toHaveBeenCalledTimes(1);
    expect(trx.delete).toHaveBeenCalledTimes(10);
    expect(trx.insert).toHaveBeenCalledTimes(1);
    expect(valuesArgs).toHaveLength(1);
    expect(valuesArgs[0]).toEqual(backup.data.exercises);
    expect(valuesArgs.every((rows) => rows.length > 0)).toBe(true);
  });

  it("returns failed when transaction throws", async () => {
    (db.transaction as jest.Mock).mockRejectedValue(new Error("db exploded"));

    const result = await transactionalRestore(createBackup());

    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.message).toContain("db exploded");
    }
  });
});
