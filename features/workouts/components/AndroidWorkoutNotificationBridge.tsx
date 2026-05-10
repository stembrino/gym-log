import { updateWorkoutSetCompleted } from "@/features/workouts/dao/mutations/workoutMutations";
import {
  getActiveWorkout,
  type ActiveWorkoutRow,
} from "@/features/workouts/dao/queries/workoutQueries";
import {
  ensureAndroidWorkoutNotificationSetup,
  isCompleteSetActionResponse,
  isNextSetActionResponse,
  isOpenAppActionResponse,
  isPreviousSetActionResponse,
  isWorkoutNotificationResponse,
  requestAndroidWorkoutNotificationPermission,
  resetAndroidWorkoutNotificationSetup,
  syncActiveWorkoutNotification,
  type NotificationActionLabels,
} from "@/features/workouts/services/androidWorkoutNotification";
import { useAndroidNotificationPreference } from "@/features/workouts/providers/AndroidNotificationPreferenceProvider";
import { useI18n } from "@/components/providers/i18n-provider";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import * as Notifications from "expo-notifications";
import { AppState, Platform } from "react-native";

function getOrderedSetIds(workout: ActiveWorkoutRow): string[] {
  return workout.exercises
    .slice()
    .sort((a, b) => a.exerciseOrder - b.exerciseOrder)
    .flatMap((exercise) => exercise.sets.map((set) => set.id));
}

function getAdjacentSetId(
  workout: ActiveWorkoutRow,
  currentSetId: string,
  direction: "previous" | "next",
): string | null {
  const orderedSetIds = getOrderedSetIds(workout);
  const currentIndex = orderedSetIds.indexOf(currentSetId);

  if (currentIndex === -1) {
    return null;
  }

  if (direction === "previous") {
    return currentIndex > 0 ? orderedSetIds[currentIndex - 1] : null;
  }

  return currentIndex < orderedSetIds.length - 1 ? orderedSetIds[currentIndex + 1] : null;
}

export function AndroidWorkoutNotificationBridge() {
  const router = useRouter();
  const { enabled } = useAndroidNotificationPreference();
  const { t, locale } = useI18n();

  const labels = useMemo<NotificationActionLabels>(
    () => ({
      complete: t("workouts.notificationActionComplete"),
      back: t("workouts.notificationActionBack"),
      next: t("workouts.notificationActionNext"),
      open: t("workouts.notificationActionOpen"),
      bodyPattern: (setIndex, totalSets, weight, reps) =>
        t("workouts.notificationBodyPattern", { setIndex, totalSets, weight, reps }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  // Reset notification category when locale changes so buttons get retranslated
  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }
    resetAndroidWorkoutNotificationSetup();
  }, [locale, enabled]);

  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }

    void (async () => {
      await requestAndroidWorkoutNotificationPermission();
      await ensureAndroidWorkoutNotificationSetup(labels);
      console.log("[WorkoutNotification] Setup complete");
    })();
  }, [enabled, labels]);

  // Resync notification when app returns to foreground
  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        console.log("[WorkoutNotification] App returned to foreground, resyncing notification");
        void (async () => {
          const activeWorkout = await getActiveWorkout();
          await syncActiveWorkoutNotification(activeWorkout, labels);
        })();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, labels]);

  // Handle notification responses
  useEffect(() => {
    if (Platform.OS !== "android" || !enabled) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void (async () => {
        try {
          if (!isWorkoutNotificationResponse(response)) {
            console.log("[WorkoutNotification] Response is not a workout notification");
            return;
          }

          console.log("[WorkoutNotification] Handling response:", response.actionIdentifier);

          if (
            response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ||
            isOpenAppActionResponse(response)
          ) {
            console.log("[WorkoutNotification] Opening app");
            router.replace("/workout-in-progress");
            return;
          }

          const setId = response.notification.request.content.data?.setId;
          if (typeof setId !== "string" || setId.length === 0) {
            console.warn("[WorkoutNotification] Invalid or missing setId:", setId);
            return;
          }

          if (isCompleteSetActionResponse(response) || isNextSetActionResponse(response)) {
            console.log("[WorkoutNotification] Marking set as complete:", setId);
            await updateWorkoutSetCompleted({
              setId,
              completed: true,
            });

            const activeWorkout = await getActiveWorkout();
            if (activeWorkout) {
              await syncActiveWorkoutNotification(activeWorkout, labels);
              console.log("[WorkoutNotification] Notification synced after complete");
            } else {
              console.warn("[WorkoutNotification] No active workout found after complete");
            }
            return;
          }

          if (!isPreviousSetActionResponse(response)) {
            console.warn("[WorkoutNotification] Unknown action type");
            return;
          }

          const activeWorkout = await getActiveWorkout();
          if (!activeWorkout) {
            console.warn("[WorkoutNotification] No active workout for previous action");
            return;
          }

          const previousSetId = getAdjacentSetId(activeWorkout, setId, "previous");
          if (!previousSetId) {
            console.warn("[WorkoutNotification] No previous set found");
            return;
          }

          console.log("[WorkoutNotification] Marking set as incomplete:", previousSetId);
          await updateWorkoutSetCompleted({
            setId: previousSetId,
            completed: false,
          });

          const refreshedWorkout = await getActiveWorkout();
          if (refreshedWorkout) {
            await syncActiveWorkoutNotification(refreshedWorkout, labels);
            console.log("[WorkoutNotification] Notification synced after previous");
          } else {
            console.warn("[WorkoutNotification] No active workout found after previous");
          }
        } catch (error) {
          console.error("[WorkoutNotification] Error handling notification response:", error);
        }
      })();
    });

    return () => {
      subscription.remove();
    };
  }, [router, enabled, labels]);

  return null;
}
