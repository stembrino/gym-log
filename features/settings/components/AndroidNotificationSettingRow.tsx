import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useColorScheme } from "@/components/hooks/useColorScheme";
import { monoFont } from "@/constants/retroTheme";
import Colors from "@/constants/Colors";
import { useAndroidNotificationPreference } from "@/features/workouts/providers/AndroidNotificationPreferenceProvider";

export function AndroidNotificationSettingRow() {
  if (Platform.OS !== "android") {
    return null;
  }

  return <AndroidNotificationSettingRowContent />;
}

function AndroidNotificationSettingRowContent() {
  const palette = useRetroPalette();
  const colorScheme = useColorScheme();
  const { enabled, setEnabled } = useAndroidNotificationPreference();
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <Pressable
      style={[styles.settingRow, { borderBottomColor: palette.border }]}
      onPress={() => setEnabled(!enabled)}
    >
      <FontAwesome name="bell" size={18} color={palette.accent} style={styles.icon} />
      <Text style={[styles.settingLabel, { color: textColor, flex: 1 }]}>
        Notificação de treino
      </Text>
      <Text style={[styles.settingValue, { color: palette.textSecondary }]}>
        {enabled ? "ON" : "OFF"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
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
