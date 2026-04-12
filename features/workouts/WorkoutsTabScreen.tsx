import { useColorScheme } from "@/components/hooks/useColorScheme";
import { useI18n } from "@/components/providers/i18n-provider";
import { PrimaryButton } from "@/components/PrimaryButton";
import { getRetroPalette } from "@/constants/retroTheme";
import { SelectRoutineGroupModal } from "@/features/workouts/components/SelectRoutineGroupModal";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SelectRoutineModal } from "./components/SelectRoutineModal";

export function WorkoutsTabScreen() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  const palette = getRetroPalette(colorScheme);
  const [isSelectRoutineModalOpen, setIsSelectRoutineModalOpen] = useState(false);
  const [isSelectRoutineGroupModalOpen, setIsSelectRoutineGroupModalOpen] = useState(false);

  const handleStartWorkoutPress = () => {
    setIsSelectRoutineModalOpen(true);
  };

  const handleStartRoutineGroupPress = () => {
    setIsSelectRoutineGroupModalOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.page }]}>
      <View style={styles.buttonWrapper}>
        <PrimaryButton label={t("workouts.startWorkoutCta")} onPress={handleStartWorkoutPress} />
      </View>
      <View style={styles.buttonWrapper}>
        <PrimaryButton
          label={t("workouts.startRoutineGroupCta")}
          onPress={handleStartRoutineGroupPress}
        />
      </View>
      <SelectRoutineModal
        isOpen={isSelectRoutineModalOpen}
        onClose={() => setIsSelectRoutineModalOpen(false)}
      />
      <SelectRoutineGroupModal
        isOpen={isSelectRoutineGroupModalOpen}
        onClose={() => setIsSelectRoutineGroupModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  buttonWrapper: {
    marginTop: 16,
    width: "100%",
    maxWidth: 320,
  },
});
