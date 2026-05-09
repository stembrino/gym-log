import { useColorScheme } from "@/components/hooks/useColorScheme";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { monoFont } from "@/constants/retroTheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/Colors";

const LABS = [
  {
    id: "notification-lab",
    title: "Notification Lab",
    description: "Preview visual do card de treino ativo na notificação Android.",
    icon: "bell-o" as const,
    route: "/notification-lab" as const,
  },
] as const;

export function DevLabScreen() {
  const router = useRouter();
  const palette = useRetroPalette();
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? "light"].text;

  return (
    <View style={[styles.container, { backgroundColor: palette.page }]}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View
          style={[
            styles.headerCard,
            { borderColor: palette.border, backgroundColor: palette.card },
          ]}
        >
          <Text style={[styles.headerTitle, { color: textColor }]}>DEV LAB</Text>
          <Text style={[styles.headerSubtitle, { color: palette.textSecondary }]}>
            Painel de experimentos temporários para validar comportamento e UI.
          </Text>
        </View>

        {LABS.map((lab) => (
          <Pressable
            key={lab.id}
            style={[styles.labRow, { borderColor: palette.border, backgroundColor: palette.card }]}
            onPress={() => router.push(lab.route)}
          >
            <View style={styles.labLeft}>
              <FontAwesome name={lab.icon} size={18} color={palette.accent} style={styles.icon} />
              <View style={styles.labCopy}>
                <Text style={[styles.labTitle, { color: textColor }]}>{lab.title}</Text>
                <Text style={[styles.labDescription, { color: palette.textSecondary }]}>
                  {lab.description}
                </Text>
              </View>
            </View>
            <Text style={[styles.openText, { color: palette.textSecondary }]}>OPEN</Text>
          </Pressable>
        ))}
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
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 10,
  },
  headerCard: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 12,
    gap: 6,
  },
  headerTitle: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  labRow: {
    borderWidth: 1,
    borderRadius: 2,
    minHeight: 56,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  labLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  icon: {
    width: 20,
    textAlign: "center",
  },
  labCopy: {
    flex: 1,
    gap: 2,
  },
  labTitle: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  labDescription: {
    fontFamily: monoFont,
    fontSize: 10,
    letterSpacing: 0.2,
    lineHeight: 14,
  },
  openText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
