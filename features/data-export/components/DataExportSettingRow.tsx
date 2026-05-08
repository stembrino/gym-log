import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColorScheme } from "@/components/hooks/useColorScheme";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import Colors from "@/constants/Colors";
import { monoFont } from "@/constants/retroTheme";
import { useDataExport } from "../hooks/useDataExport";

export function DataExportSettingRow() {
  const colorScheme = useColorScheme();
  const palette = useRetroPalette();
  const { t } = useI18n();
  const { alertElement, exportData, isExporting } = useDataExport();
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <>
      <Pressable style={styles.settingRow} onPress={exportData}>
        <View style={styles.settingContent}>
          <FontAwesome
            name="download"
            size={18}
            color={palette.accent}
            style={{ marginRight: 12 }}
          />
          <Text style={[styles.settingLabel, { color: textColor }]}>
            {t("settings.dataExport")}
          </Text>
        </View>
        <Text style={[styles.settingValue, { color: palette.textSecondary }]}>
          {isExporting ? t("settings.dataExportLoading") : t("settings.dataExportAction")}
        </Text>
      </Pressable>

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
  },
});
