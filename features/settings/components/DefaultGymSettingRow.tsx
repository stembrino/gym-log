import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";
import { useColorScheme } from "@/components/hooks/useColorScheme";
import { useGlobalAlert } from "@/components/hooks/useGlobalAlert";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import Colors from "@/constants/Colors";
import { monoFont } from "@/constants/retroTheme";
import { SelectGymModal } from "@/features/workouts/components/SelectGymModal";
import { createGym, setDefaultGym, type GymItem } from "@/features/workouts/dao/queries/gymQueries";
import { useGymPicker } from "@/features/workouts/hooks/useGymPicker";

export function DefaultGymSettingRow() {
  const colorScheme = useColorScheme();
  const palette = useRetroPalette();
  const { t } = useI18n();
  const { showAlert, alertElement } = useGlobalAlert();
  const { gyms, loading, reload } = useGymPicker({ autoSelectDefault: false });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const textColor = Colors[colorScheme ?? "light"].text;

  const defaultGym = useMemo<GymItem | null>(
    () => gyms.find((gym) => gym.isDefault) ?? null,
    [gyms],
  );

  const handleSelectDefaultGym = (gymId: string | null) => {
    void (async () => {
      try {
        await setDefaultGym(gymId);
        await reload();
        setIsModalOpen(false);
      } catch {
        showAlert({
          title: t("settings.defaultGymSaveErrorTitle"),
          message: t("settings.defaultGymSaveErrorBody"),
          buttonLabel: t("workouts.postFinishCloseCta"),
        });
      }
    })();
  };

  const handleAddGym = async (name: string) => {
    try {
      const createdGym = await createGym(name);
      await setDefaultGym(createdGym.id);
      await reload();
      return true;
    } catch {
      showAlert({
        title: t("workouts.postFinishGymCreateErrorTitle"),
        message: t("workouts.postFinishGymCreateErrorBody"),
        buttonLabel: t("workouts.postFinishCloseCta"),
      });
      return false;
    }
  };

  return (
    <>
      <Pressable style={styles.settingRow} onPress={() => setIsModalOpen(true)}>
        <View style={styles.settingContent}>
          <FontAwesome
            name="building-o"
            size={18}
            color={palette.accent}
            style={{ marginRight: 12 }}
          />
          <Text style={[styles.settingLabel, { color: textColor }]}>
            {t("settings.defaultGym")}
          </Text>
        </View>
        <Text style={[styles.settingValue, { color: palette.textSecondary }]}>
          {defaultGym?.name ?? t("settings.defaultGymNotSet")}
        </Text>
      </Pressable>

      <SelectGymModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gyms={gyms}
        selectedGymId={defaultGym?.id ?? null}
        loading={loading}
        title={t("settings.defaultGym")}
        noneLabel={t("workouts.gymNoneOption")}
        addPlaceholder={t("workouts.gymAddPlaceholder")}
        addButtonLabel={t("workouts.gymAddButton")}
        emptyLabel={t("workouts.gymEmptyState")}
        onSelectGym={handleSelectDefaultGym}
        onAddGym={handleAddGym}
      />

      {alertElement}
    </>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "600",
  },
  settingValue: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    maxWidth: "45%",
  },
});
