import { db } from "@/db/client";
import {
  gyms,
  exercises,
  routines,
  routineTags,
  routineExercises,
  routineTagLinks,
  workouts,
  workoutExercises,
  sets,
  entityTranslations,
} from "@/db/schema";
import type { GymLogBackupFile } from "../../data-transfer/types/backup";

export async function transactionalRestore(
  backup: GymLogBackupFile,
): Promise<
  | { status: "success"; restoredCounts: Record<string, number> }
  | { status: "failed"; message: string }
> {
  try {
    await db.transaction(async (trx) => {
      // Clear existing data in dependency-safe order
      await trx.delete(sets);
      await trx.delete(workoutExercises);
      await trx.delete(workouts);
      await trx.delete(routineTagLinks);
      await trx.delete(routineExercises);
      await trx.delete(routines);
      await trx.delete(routineTags);
      await trx.delete(entityTranslations);
      await trx.delete(gyms);
      await trx.delete(exercises);

      // Insert new data in dependency-safe order
      if (backup.data.gyms.length > 0) {
        await trx.insert(gyms).values(backup.data.gyms);
      }

      if (backup.data.exercises.length > 0) {
        await trx.insert(exercises).values(backup.data.exercises);
      }

      if (backup.data.routines.length > 0) {
        await trx.insert(routines).values(backup.data.routines);
      }

      if (backup.data.routineTags.length > 0) {
        await trx.insert(routineTags).values(backup.data.routineTags);
      }

      if (backup.data.routineExercises.length > 0) {
        await trx.insert(routineExercises).values(backup.data.routineExercises);
      }

      if (backup.data.routineTagLinks.length > 0) {
        await trx.insert(routineTagLinks).values(backup.data.routineTagLinks);
      }

      if (backup.data.workouts.length > 0) {
        await trx.insert(workouts).values(backup.data.workouts);
      }

      if (backup.data.workoutExercises.length > 0) {
        await trx.insert(workoutExercises).values(backup.data.workoutExercises);
      }

      if (backup.data.sets.length > 0) {
        await trx.insert(sets).values(backup.data.sets);
      }

      if (backup.data.entityTranslations.length > 0) {
        await trx.insert(entityTranslations).values(backup.data.entityTranslations);
      }
    });

    return {
      status: "success",
      restoredCounts: backup.counts,
    };
  } catch (error) {
    return {
      status: "failed",
      message: `Restore failed: ${(error as Error).message}`,
    };
  }
}
