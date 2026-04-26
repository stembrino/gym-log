import {
  getLastCompletedExerciseSnapshot,
  type LastCompletedExerciseSnapshot,
} from "@/features/workouts/dao/queries/workoutSetQueries";
import { useCallback, useState } from "react";

export type ExerciseHistoryScope = "currentGym" | "otherGyms";

type ExerciseLastSessionState =
  | {
      status: "idle";
      snapshot: null;
    }
  | {
      status: "loading";
      snapshot: null;
    }
  | {
      status: "loaded";
      snapshot: LastCompletedExerciseSnapshot;
    }
  | {
      status: "empty";
      snapshot: null;
    }
  | {
      status: "error";
      snapshot: null;
    };

const IDLE_STATE: ExerciseLastSessionState = {
  status: "idle",
  snapshot: null,
};

function buildStateKey(exerciseId: string, scope: ExerciseHistoryScope) {
  return `${scope}:${exerciseId}`;
}

export function useExerciseLastSession(activeWorkoutId: string | null, activeGymId: string | null) {
  const [stateByExerciseScope, setStateByExerciseScope] = useState<
    Record<string, ExerciseLastSessionState>
  >({});

  const ensureLoaded = useCallback(
    async (exerciseId: string, scope: ExerciseHistoryScope = "currentGym") => {
      const stateKey = buildStateKey(exerciseId, scope);
      const currentState = stateByExerciseScope[stateKey];

      if (
        currentState?.status === "loading" ||
        currentState?.status === "loaded" ||
        currentState?.status === "empty"
      ) {
        return;
      }

      setStateByExerciseScope((prev) => ({
        ...prev,
        [stateKey]: {
          status: "loading",
          snapshot: null,
        },
      }));

      try {
        const gymIdFilter = scope === "currentGym" ? activeGymId : undefined;

        const snapshot = await getLastCompletedExerciseSnapshot({
          exerciseId,
          excludeWorkoutId: activeWorkoutId ?? undefined,
          gymId: gymIdFilter,
        });

        setStateByExerciseScope((prev) => ({
          ...prev,
          [stateKey]: snapshot
            ? {
                status: "loaded",
                snapshot,
              }
            : {
                status: "empty",
                snapshot: null,
              },
        }));
      } catch {
        setStateByExerciseScope((prev) => ({
          ...prev,
          [stateKey]: {
            status: "error",
            snapshot: null,
          },
        }));
      }
    },
    [activeGymId, activeWorkoutId, stateByExerciseScope],
  );

  const retry = useCallback(
    async (exerciseId: string, scope: ExerciseHistoryScope = "currentGym") => {
      const stateKey = buildStateKey(exerciseId, scope);

      setStateByExerciseScope((prev) => ({
        ...prev,
        [stateKey]: IDLE_STATE,
      }));

      await ensureLoaded(exerciseId, scope);
    },
    [ensureLoaded],
  );

  const getState = useCallback(
    (exerciseId: string, scope: ExerciseHistoryScope = "currentGym"): ExerciseLastSessionState => {
      const stateKey = buildStateKey(exerciseId, scope);
      return stateByExerciseScope[stateKey] ?? IDLE_STATE;
    },
    [stateByExerciseScope],
  );

  const resetAll = useCallback(() => {
    setStateByExerciseScope({});
  }, []);

  return {
    getState,
    ensureLoaded,
    retry,
    resetAll,
  };
}

export type { ExerciseLastSessionState };
