import { monoFont } from "@/constants/retroTheme";
import type { WorkoutStatus } from "@/features/workouts/dao/queries/workoutQueries";
import { StyleSheet, Text, View } from "react-native";

type WorkoutStatusIndicatorProps = {
  status: WorkoutStatus;
  labels: {
    inProgress: string;
    paused: string;
  };
};

export function WorkoutStatusIndicator({ status, labels }: WorkoutStatusIndicatorProps) {
  const visual =
    status === "paused"
      ? {
          label: labels.paused,
          backgroundColor: "#FEF3C7",
          borderColor: "#F59E0B",
          textColor: "#92400E",
        }
      : {
          label: labels.inProgress,
          backgroundColor: "#DCFCE7",
          borderColor: "#16A34A",
          textColor: "#166534",
        };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: visual.backgroundColor,
          borderColor: visual.borderColor,
        },
      ]}
    >
      <Text style={[styles.text, { color: visual.textColor }]}>{visual.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 2,
    minHeight: 28,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
