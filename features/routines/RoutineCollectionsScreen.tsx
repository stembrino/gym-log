import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import { monoFont } from "@/constants/retroTheme";
import { StyleSheet, Text, View } from "react-native";

export function RoutineCollectionsScreen() {
  const palette = useRetroPalette();
  const { t } = useI18n();

  return (
    <View style={[styles.container, { backgroundColor: palette.page }]}>
      <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>
          {t("routines.collectionsPlaceholderEyebrow")}
        </Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {t("routines.collectionsPlaceholderTitle")}
        </Text>
        <Text style={[styles.body, { color: palette.textSecondary }]}>
          {t("routines.collectionsPlaceholderBody")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 18,
    gap: 10,
  },
  eyebrow: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: monoFont,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
