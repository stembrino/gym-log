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
import { Platform } from "react-native";

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
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void (async () => {
        if (!isWorkoutNotificationResponse(response)) {
          return;
        }

        if (
          response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER ||
          isOpenAppActionResponse(response)
        ) {
          router.replace("/workout-in-progress");
          return;
        }

        const setId = response.notification.request.content.data?.setId;
        if (typeof setId !== "string" || setId.length === 0) {
          return;
        }

        if (isCompleteSetActionResponse(response) || isNextSetActionResponse(response)) {
          await updateWorkoutSetCompleted({
            setId,
            completed: true,
          });

          const activeWorkout = await getActiveWorkout();
          await syncActiveWorkoutNotification(activeWorkout, labels);
          return;
        }

        if (!isPreviousSetActionResponse(response)) {
          return;
        }

        const activeWorkout = await getActiveWorkout();
        if (!activeWorkout) {
          return;
        }

        const previousSetId = getAdjacentSetId(activeWorkout, setId, "previous");
        if (!previousSetId) {
          return;
        }

        await updateWorkoutSetCompleted({
          setId: previousSetId,
          completed: false,
        });

        const refreshedWorkout = await getActiveWorkout();
        await syncActiveWorkoutNotification(refreshedWorkout, labels);
      })();
    });

    return () => {
      subscription.remove();
    };
  }, [router, enabled, labels]);

  return null;
}
