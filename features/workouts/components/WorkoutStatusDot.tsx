import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import type { WorkoutStatus } from "@/features/workouts/dao/queries/workoutQueries";
import { useStatusPulse } from "@/features/workouts/hooks/useStatusPulse";
import { Animated, StyleSheet } from "react-native";

type WorkoutStatusDotProps = {
  status?: WorkoutStatus;
};

export function WorkoutStatusDot({ status }: WorkoutStatusDotProps) {
  const palette = useRetroPalette();
  const statusPulse = useStatusPulse(status === "in_progress");

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: status === "paused" ? palette.textSecondary : palette.success,
          transform: [{ scale: statusPulse }],
          opacity: statusPulse.interpolate({
            inputRange: [0.98, 1.1],
            outputRange: [0.86, 1],
          }),
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
