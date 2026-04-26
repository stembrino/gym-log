import { monoFont } from "@/constants/retroTheme";
import type { AppLocale } from "@/constants/translations";
import type { LogbookWorkoutItem } from "@/features/logbook/dao/queries/logbookQueries";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, Text, View } from "react-native";

type LogbookSetDetailsListProps = {
  setDetails: LogbookWorkoutItem["setDetails"];
  locale: AppLocale;
  noSetDetailsLabel: string;
  repsUnitSuffix: string;
  weightUnit: string;
  highlightedSetIds: Set<string>;
  dividerColor: string;
  textColor: string;
  highlightColor: string;
};

type ExerciseGroup = {
  exerciseName: string;
  sets: LogbookWorkoutItem["setDetails"];
};

function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function groupSetsByExercise(setDetails: LogbookWorkoutItem["setDetails"]): ExerciseGroup[] {
  const groups = new Map<string, ExerciseGroup>();

  for (const set of setDetails) {
    const existing = groups.get(set.exerciseName);

    if (existing) {
      existing.sets.push(set);
      continue;
    }

    groups.set(set.exerciseName, {
      exerciseName: set.exerciseName,
      sets: [set],
    });
  }

  return Array.from(groups.values());
}

export function LogbookSetDetailsList({
  setDetails,
  locale,
  noSetDetailsLabel,
  repsUnitSuffix,
  weightUnit,
  highlightedSetIds,
  dividerColor,
  textColor,
  highlightColor,
}: LogbookSetDetailsListProps) {
  if (setDetails.length === 0) {
    return <Text style={[styles.setDetailText, { color: textColor }]}>{noSetDetailsLabel}</Text>;
  }

  const groups = groupSetsByExercise(setDetails);

  return (
    <View style={styles.container}>
      {groups.map((group, index) => (
        <View key={`${group.exerciseName}-${index}`} style={styles.groupWrap}>
          <Text style={[styles.exerciseTitle, { color: textColor }]}>
            {group.exerciseName.toLocaleUpperCase(locale)}
          </Text>

          <View style={styles.rowsCol}>
            {group.sets.map((set) => {
              const isMaxWeight = highlightedSetIds.has(set.id);
              return (
                <View key={set.id} style={styles.setRow}>
                  <Text
                    style={[
                      styles.setDetailText,
                      { color: isMaxWeight ? highlightColor : textColor },
                    ]}
                  >
                    {set.setOrder}: {set.reps} {repsUnitSuffix} x {formatNumber(set.weight, locale)}
                    {weightUnit}
                  </Text>

                  {isMaxWeight ? (
                    <View style={[styles.maxBadge, { borderColor: highlightColor }]}>
                      <FontAwesome name="arrow-up" size={8} color={highlightColor} />
                      <Text style={[styles.maxBadgeText, { color: highlightColor }]}>MAX</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {index < groups.length - 1 ? (
            <View style={[styles.exerciseDivider, { backgroundColor: dividerColor }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  groupWrap: {
    gap: 4,
  },
  exerciseTitle: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  rowsCol: {
    gap: 2,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  setDetailText: {
    flexShrink: 1,
    fontFamily: monoFont,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  maxBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  maxBadgeText: {
    fontFamily: monoFont,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  exerciseDivider: {
    height: 1,
    opacity: 0.45,
    marginTop: 4,
  },
});
