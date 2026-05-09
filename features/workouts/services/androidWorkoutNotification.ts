import type { ActiveWorkoutRow } from "@/features/workouts/dao/queries/workoutQueries";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const WORKOUT_CHANNEL_ID = "workout-active";
const WORKOUT_CATEGORY_ID = "workout-active-actions";
const WORKOUT_ACTION_COMPLETE_SET_ID = "workout-complete-set";
const WORKOUT_ACTION_PREVIOUS_SET_ID = "workout-previous-set";
const WORKOUT_ACTION_NEXT_SET_ID = "workout-next-set";
const WORKOUT_ACTION_OPEN_APP_ID = "workout-open-app";
const WORKOUT_NOTIFICATION_SOURCE = "workout-active";

export type NotificationActionLabels = {
  complete: string;
  back: string;
  next: string;
  open: string;
  bodyPattern: (
    setIndex: number,
    totalSets: number,
    weight: string,
    reps: number | string,
  ) => string;
};

let configured = false;
let activeNotificationId: string | null = null;

function isAndroid() {
  return Platform.OS === "android";
}

function findNextPendingSet(workout: ActiveWorkoutRow) {
  const orderedExercises = workout.exercises
    .slice()
    .sort((a, b) => a.exerciseOrder - b.exerciseOrder);

  for (const exercise of orderedExercises) {
    const totalSets = exercise.sets.length;

    for (let index = 0; index < totalSets; index += 1) {
      const set = exercise.sets[index];
      if (!set.completed) {
        return {
          setId: set.id,
          exerciseName: exercise.exercise.name,
          setIndex: index + 1,
          totalSets,
          reps: set.reps,
          weight: set.weight,
        };
      }
    }
  }

  return null;
}

function formatWeight(weight: number) {
  if (Number.isInteger(weight)) {
    return String(weight);
  }

  return weight.toFixed(1);
}

export function resetAndroidWorkoutNotificationSetup(): void {
  configured = false;
}

export async function ensureAndroidWorkoutNotificationSetup(
  labels: NotificationActionLabels,
): Promise<void> {
  if (!isAndroid() || configured) {
    return;
  }

  await Notifications.setNotificationChannelAsync(WORKOUT_CHANNEL_ID, {
    name: "Workout Active",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    showBadge: false,
  });

  await Notifications.setNotificationCategoryAsync(WORKOUT_CATEGORY_ID, [
    {
      identifier: WORKOUT_ACTION_COMPLETE_SET_ID,
      buttonTitle: labels.complete,
      options: { opensAppToForeground: false },
    },
    {
      identifier: WORKOUT_ACTION_PREVIOUS_SET_ID,
      buttonTitle: labels.back,
      options: { opensAppToForeground: false },
    },
    {
      identifier: WORKOUT_ACTION_NEXT_SET_ID,
      buttonTitle: labels.next,
      options: { opensAppToForeground: false },
    },
    {
      identifier: WORKOUT_ACTION_OPEN_APP_ID,
      buttonTitle: labels.open,
      options: { opensAppToForeground: true },
    },
  ]);

  configured = true;
}

export async function requestAndroidWorkoutNotificationPermission(): Promise<void> {
  if (!isAndroid()) {
    return;
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return;
  }

  await Notifications.requestPermissionsAsync();
}

export async function dismissActiveWorkoutNotification(): Promise<void> {
  if (!isAndroid()) {
    return;
  }

  if (activeNotificationId) {
    await Notifications.dismissNotificationAsync(activeNotificationId);
    activeNotificationId = null;
    return;
  }

  const notifications = await Notifications.getPresentedNotificationsAsync();
  const workoutNotification = notifications.find(
    (item) => item.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE,
  );

  if (workoutNotification) {
    await Notifications.dismissNotificationAsync(workoutNotification.request.identifier);
  }
}

export async function syncActiveWorkoutNotification(
  workout: ActiveWorkoutRow | null,
  labels: NotificationActionLabels,
): Promise<void> {
  if (!isAndroid()) {
    return;
  }

  await ensureAndroidWorkoutNotificationSetup(labels);

  if (!workout || workout.status !== "in_progress") {
    await dismissActiveWorkoutNotification();
    return;
  }

  const nextPendingSet = findNextPendingSet(workout);
  if (!nextPendingSet) {
    await dismissActiveWorkoutNotification();
    return;
  }

  await dismissActiveWorkoutNotification();

  const repsLabel = nextPendingSet.reps > 0 ? nextPendingSet.reps : "-";
  const weightLabel = nextPendingSet.weight > 0 ? formatWeight(nextPendingSet.weight) : "-";

  activeNotificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: nextPendingSet.exerciseName,
      body: labels.bodyPattern(
        nextPendingSet.setIndex,
        nextPendingSet.totalSets,
        weightLabel,
        repsLabel,
      ),
      data: {
        source: WORKOUT_NOTIFICATION_SOURCE,
        workoutId: workout.id,
        setId: nextPendingSet.setId,
      },
      categoryIdentifier: WORKOUT_CATEGORY_ID,
      sticky: true,
      autoDismiss: false,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: null,
  });
}

export function isCompleteSetActionResponse(response: Notifications.NotificationResponse): boolean {
  return (
    response.actionIdentifier === WORKOUT_ACTION_COMPLETE_SET_ID &&
    response.notification.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE
  );
}

export function isPreviousSetActionResponse(response: Notifications.NotificationResponse): boolean {
  return (
    response.actionIdentifier === WORKOUT_ACTION_PREVIOUS_SET_ID &&
    response.notification.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE
  );
}

export function isWorkoutNotificationResponse(
  response: Notifications.NotificationResponse,
): boolean {
  return response.notification.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE;
}

export function isNextSetActionResponse(response: Notifications.NotificationResponse): boolean {
  return (
    response.actionIdentifier === WORKOUT_ACTION_NEXT_SET_ID &&
    response.notification.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE
  );
}

export function isOpenAppActionResponse(response: Notifications.NotificationResponse): boolean {
  return (
    response.actionIdentifier === WORKOUT_ACTION_OPEN_APP_ID &&
    response.notification.request.content.data?.source === WORKOUT_NOTIFICATION_SOURCE
  );
}
