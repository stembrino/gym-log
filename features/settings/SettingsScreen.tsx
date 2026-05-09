import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/hooks/useColorScheme";
import { useI18n } from "@/components/providers/i18n-provider";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { LanguageSettingRow } from "@/features/settings/components/LanguageSettingRow";
import { DefaultGymSettingRow } from "@/features/settings/components/DefaultGymSettingRow";
import { SettingsSection } from "@/features/settings/components/SettingsSection";
import { ThemeSettingRow } from "@/features/settings/components/ThemeSettingRow";
import { RateAppSettingRow } from "@/features/settings/components/RateAppSettingRow";
import { FeedbackSettingRow } from "@/features/settings/components/FeedbackSettingRow";
import { DataExportSettingRow } from "@/features/data-export/components/DataExportSettingRow";
import { DataImportSettingRow } from "@/features/data-import/components/DataImportSettingRow";
import { AndroidNotificationSettingRow } from "@/features/settings/components/AndroidNotificationSettingRow";
import Colors from "@/constants/Colors";
import { FEATURE_FLAGS } from "@/constants/featureFlags";
import { monoFont } from "@/constants/retroTheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  const palette = useRetroPalette();
  const insets = useSafeAreaInsets();

  const backgroundColor = Colors[colorScheme ?? "light"].background;
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <SettingsSection
          title={t("settings.appearance") || "Appearance"}
          textColor={textColor}
          borderColor={palette.border}
        >
          <ThemeSettingRow />
        </SettingsSection>

        <SettingsSection
          title={t("settings.language") || "Language"}
          textColor={textColor}
          borderColor={palette.border}
        >
          <LanguageSettingRow />
        </SettingsSection>

        <SettingsSection
          title={t("settings.workout") || "Workout"}
          textColor={textColor}
          borderColor={palette.border}
        >
          <DefaultGymSettingRow />
          <AndroidNotificationSettingRow />
        </SettingsSection>

        {FEATURE_FLAGS.settingsRateApp ? (
          <SettingsSection
            title={t("settings.rateApp") || "Rate App"}
            textColor={textColor}
            borderColor={palette.border}
          >
            <RateAppSettingRow />
          </SettingsSection>
        ) : null}

        {FEATURE_FLAGS.settingsDataExport || FEATURE_FLAGS.settingsDataImport ? (
          <SettingsSection
            title={t("settings.data") || "Data"}
            textColor={textColor}
            borderColor={palette.border}
          >
            {FEATURE_FLAGS.settingsDataExport ? <DataExportSettingRow /> : null}
            {FEATURE_FLAGS.settingsDataImport ? <DataImportSettingRow /> : null}
          </SettingsSection>
        ) : null}

        <SettingsSection
          title={t("settings.support")}
          textColor={textColor}
          borderColor={palette.border}
        >
          <FeedbackSettingRow />
        </SettingsSection>

        {__DEV__ ? (
          <SettingsSection title="Dev" textColor={textColor} borderColor={palette.border}>
            <Pressable style={styles.settingRow} onPress={() => router.push("/dev-lab")}>
              <View style={styles.settingContent}>
                <FontAwesome
                  name="flask"
                  size={18}
                  color={palette.accent}
                  style={{ marginRight: 12 }}
                />
                <Text style={[styles.settingLabel, { color: textColor }]}>Dev Lab</Text>
              </View>
              <Text style={[styles.settingValue, { color: palette.textSecondary }]}>Open</Text>
            </Pressable>
          </SettingsSection>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 12,
  },
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
  },
});
