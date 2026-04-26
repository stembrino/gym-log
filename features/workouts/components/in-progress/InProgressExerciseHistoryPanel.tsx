import { monoFont } from "@/constants/retroTheme";
import type { ExerciseLastSessionState } from "@/features/workouts/hooks/useExerciseLastSession";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Palette = {
  page: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
};

type InProgressExerciseHistoryPanelProps = {
  palette: Palette;
  t: (key: string, vars?: Record<string, unknown>) => string;
  currentGymState: ExerciseLastSessionState;
  otherGymsState: ExerciseLastSessionState;
  gymName: string | null;
  onRetryCurrentGym: () => void;
  onLoadOtherGyms: () => void;
  onRetryOtherGyms: () => void;
  onCopySets?: () => Promise<void>;
  copyingSetS?: boolean;
};

function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(1);
}

function getRelativeDaysLabel(
  input: string,
  t: (key: string, vars?: Record<string, unknown>) => string,
): string {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }

  const now = new Date();
  const diffMs = now.getTime() - parsed.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const dayLabel =
    days === 1 ? t("workouts.historyPanelDaySingular") : t("workouts.historyPanelDayPlural");

  return `${days} ${dayLabel} ${t("workouts.historyPanelAgoSuffix")}`;
}

export function InProgressExerciseHistoryPanel({
  palette,
  t,
  currentGymState,
  otherGymsState,
  gymName,
  onRetryCurrentGym,
  onLoadOtherGyms,
  onRetryOtherGyms,
  onCopySets,
  copyingSetS,
}: InProgressExerciseHistoryPanelProps) {
  const renderSnapshotContent = (
    state: Extract<ExerciseLastSessionState, { status: "loaded" }>,
  ) => {
    const { snapshot } = state;

    return (
      <View style={styles.contentGroup}>
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {t("workouts.historyPanelLastSessionPrefix")}:{" "}
          {getRelativeDaysLabel(snapshot.workoutDate, t)}
        </Text>
        {snapshot.bestSet ? (
          <Text style={[styles.message, { color: palette.textSecondary }]}>
            {t("workouts.historyPanelBestSetPrefix")}: {formatNumber(snapshot.bestSet.weight)}
            {t("workouts.weightUnit")} x {snapshot.bestSet.reps} {t("workouts.repsUnitSuffix")}
          </Text>
        ) : null}
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {t("workouts.historyPanelVolumePrefix")}: {formatNumber(snapshot.totalVolume)}{" "}
          {t("workouts.weightUnit")}
        </Text>

        <View style={styles.setList}>
          {snapshot.sets.map((setRow) => (
            <Text key={setRow.id} style={[styles.setText, { color: palette.textPrimary }]}>
              {t("workouts.setLabel")} {setRow.setOrder}: {formatNumber(setRow.weight)}
              {t("workouts.weightUnit")} x {setRow.reps} {t("workouts.repsUnitSuffix")}
            </Text>
          ))}
        </View>

        {onCopySets ? (
          <TouchableOpacity
            style={[styles.copySetsButton, { borderColor: palette.accent }]}
            onPress={onCopySets}
            disabled={copyingSetS}
          >
            <Text style={[styles.copySetsButtonText, { color: palette.accent }]}>
              {copyingSetS ? t("routines.loading") : t("workouts.historyPanelCopySetsButton")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderFallbackSection = () => {
    if (currentGymState.status !== "empty") {
      return null;
    }

    if (otherGymsState.status === "loaded") {
      return (
        <View style={styles.fallbackGroup}>
          <Text style={[styles.message, { color: palette.accent }]}>
            {t("workouts.historyPanelFoundInOtherGymPrefix")}:{" "}
            {otherGymsState.snapshot.gymName ?? t("workouts.gymNotDefined")}
          </Text>
          {renderSnapshotContent(otherGymsState)}
        </View>
      );
    }

    if (otherGymsState.status === "loading") {
      return (
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {t("workouts.historyPanelSearchOtherGymsLoading")}
        </Text>
      );
    }

    if (otherGymsState.status === "error") {
      return (
        <View style={styles.contentGroup}>
          <Text style={[styles.message, { color: palette.textSecondary }]}>
            {t("workouts.historyPanelOtherGymsError")}
          </Text>
          <Text style={[styles.retryText, { color: palette.accent }]} onPress={onRetryOtherGyms}>
            {t("workouts.historyPanelOtherGymsRetry")}
          </Text>
        </View>
      );
    }

    if (otherGymsState.status === "empty") {
      return (
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {t("workouts.historyPanelNoOtherGymsHistory")}
        </Text>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.searchOtherGymsButton, { borderColor: palette.border }]}
        onPress={onLoadOtherGyms}
      >
        <Text style={[styles.searchOtherGymsButtonText, { color: palette.textPrimary }]}>
          {t("workouts.historyPanelSearchOtherGymsCta")}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (currentGymState.status === "loading" || currentGymState.status === "idle") {
      return (
        <Text style={[styles.message, { color: palette.textSecondary }]}>
          {t("workouts.historyPanelLoading")}
        </Text>
      );
    }

    if (currentGymState.status === "error") {
      return (
        <View style={styles.contentGroup}>
          <Text style={[styles.message, { color: palette.textSecondary }]}>
            {t("workouts.historyPanelError")}
          </Text>
          <Text style={[styles.retryText, { color: palette.accent }]} onPress={onRetryCurrentGym}>
            {t("workouts.historyPanelRetry")}
          </Text>
        </View>
      );
    }

    if (currentGymState.status === "empty") {
      return (
        <View style={styles.contentGroup}>
          <Text style={[styles.message, { color: palette.textSecondary }]}>
            {gymName
              ? t("workouts.historyPanelEmptyWithGym")
              : t("workouts.historyPanelEmptyWithoutGym")}
          </Text>
          {renderFallbackSection()}
        </View>
      );
    }

    return renderSnapshotContent(currentGymState);
  };

  return (
    <View
      style={[styles.container, { borderColor: palette.border, backgroundColor: palette.page }]}
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        {t("workouts.historyPanelTitle")}
      </Text>
      <Text style={[styles.message, { color: palette.textSecondary }]}>
        {t("workouts.gymFieldLabel")}: {gymName ?? t("workouts.gymNotDefined")}
      </Text>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    marginTop: 2,
  },
  title: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  message: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  contentGroup: {
    gap: 2,
  },
  retryText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  setList: {
    marginTop: 4,
    gap: 2,
  },
  setText: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  fallbackGroup: {
    gap: 4,
    marginTop: 2,
  },
  searchOtherGymsButton: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 10,
  },
  searchOtherGymsButtonText: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  copySetsButton: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 10,
  },
  copySetsButtonText: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
