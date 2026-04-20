import { useCallback } from "react";
import {
  createCustomExercise,
  deleteCustomExercise,
  type CreateExerciseInput,
} from "../dao/mutations/exerciseMutations";

export type { CreateExerciseInput } from "../dao/mutations/exerciseMutations";

export function useExerciseMutations(reload: () => Promise<void>) {
  const createExercise = useCallback(
    async (input: CreateExerciseInput) => {
      const createdExercise = await createCustomExercise(input);

      await reload();

      return createdExercise;
    },
    [reload],
  );

  const deleteExercise = useCallback(
    async (id: string) => {
      await deleteCustomExercise(id);
      await reload();
    },
    [reload],
  );

  return { createExercise, deleteExercise };
}
