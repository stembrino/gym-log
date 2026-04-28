import { useCallback } from "react";
import {
  createCustomExercise,
  deleteCustomExercise,
  type CreateExerciseInput,
  type UpdateExerciseInput,
  updateCustomExercise,
} from "../dao/mutations/exerciseMutations";

export type { CreateExerciseInput, UpdateExerciseInput } from "../dao/mutations/exerciseMutations";

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

  const updateExercise = useCallback(
    async (id: string, input: UpdateExerciseInput) => {
      const updatedExercise = await updateCustomExercise(id, input);

      await reload();

      return updatedExercise;
    },
    [reload],
  );

  return { createExercise, deleteExercise, updateExercise };
}
