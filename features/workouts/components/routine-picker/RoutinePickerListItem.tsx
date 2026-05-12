import type { WorkoutRoutinePickerItem } from "@/features/workouts/hooks/useRoutinePicker";
import { ExpandedPanel } from "@/components/ExpandedPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { monoFont } from "@/constants/retroTheme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type RoutinePickerListItemProps = {
  item: WorkoutRoutinePickerItem;
  onPress: (routine: WorkoutRoutinePickerItem) => void;
  selectLabel: string;
  exercisesLabel: string;
  repsSuffix: string;
};

export function RoutinePickerListItem({
  item,
  onPress,
  selectLabel,
  exercisesLabel,
  repsSuffix,
}: RoutinePickerListItemProps) {
  const palette = useRetroPalette();
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpandedPanel
      title={item.name}
      subtitle={item.detail ?? undefined}
      count={item.exercises.length}
      expanded={expanded}
      onToggle={() => setExpanded((prev) => !prev)}
      headerAction={<PrimaryButton label={selectLabel} onPress={() => onPress(item)} size="tiny" />}
    >
      {item.exercises.length === 0 ? (
        <Text style={[styles.emptyExercises, { color: palette.textSecondary }]}>
          {exercisesLabel}
        </Text>
      ) : (
        <View style={styles.exerciseList}>
          {item.exercises.map((exercise) => (
            <View key={exercise.id} style={[styles.exerciseRow, { borderColor: palette.border }]}>
              <Text style={[styles.exerciseOrder, { color: palette.accent }]}>
                {exercise.exerciseOrder}.
              </Text>
              <View style={styles.exerciseCopy}>
                <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>
                  {exercise.name}
                </Text>
                {exercise.setRepsTargets.length > 0 ? (
                  <View style={styles.exerciseMetaList}>
                    {exercise.setRepsTargets.map((setRepsTarget, index) => (
                      <Text
                        key={`${exercise.id}-set-${index + 1}`}
                        style={[styles.exerciseMeta, { color: palette.textSecondary }]}
                      >
                        {index + 1}: {setRepsTarget || "-"} {repsSuffix}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </ExpandedPanel>
  );
}

const styles = StyleSheet.create({
  emptyExercises: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  exerciseList: {
    gap: 6,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  exerciseOrder: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    width: 20,
    textAlign: "right",
    letterSpacing: 0.2,
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  exerciseMeta: {
    fontFamily: monoFont,
    fontSize: 10,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  exerciseMetaList: {
    gap: 2,
  },
});
