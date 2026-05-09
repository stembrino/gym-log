import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import { monoFont } from "@/constants/retroTheme";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type LabSet = {
  id: string;
  exerciseName: string;
  setIndex: number;
  totalSets: number;
  reps: number;
  weight: number;
};

const LAB_WORKOUT_SETS: LabSet[] = [
  {
    id: "a1",
    exerciseName: "PUXADA ALTA (MAQUINA)",
    setIndex: 1,
    totalSets: 2,
    reps: 10,
    weight: 72,
  },
  {
    id: "a2",
    exerciseName: "PUXADA ALTA (MAQUINA)",
    setIndex: 2,
    totalSets: 2,
    reps: 10,
    weight: 72,
  },
  { id: "b1", exerciseName: "SUPINO RETO", setIndex: 1, totalSets: 2, reps: 8, weight: 80 },
  { id: "b2", exerciseName: "SUPINO RETO", setIndex: 2, totalSets: 2, reps: 8, weight: 80 },
];

export function NotificationLabScreen() {
  const palette = useRetroPalette();
  const { t, locale } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedBySetId, setCompletedBySetId] = useState<Record<string, boolean>>({});

  const labels = useMemo(
    () => ({
      complete: t("workouts.notificationActionComplete"),
      back: t("workouts.notificationActionBack"),
      next: t("workouts.notificationActionNext"),
      open: t("workouts.notificationActionOpen"),
      bodyPattern: (setIndex: number, totalSets: number, weight: string, reps: number | string) =>
        t("workouts.notificationBodyPattern", { setIndex, totalSets, weight, reps }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  const currentSet = LAB_WORKOUT_SETS[currentIndex];
  const canGoBack = currentIndex > 0;
  const canGoNext = currentIndex < LAB_WORKOUT_SETS.length - 1;
  const currentChecked = Boolean(completedBySetId[currentSet.id]);

  const handleBack = () => {
    if (!canGoBack) {
      return;
    }

    const previousSet = LAB_WORKOUT_SETS[currentIndex - 1];
    setCompletedBySetId((prev) => ({ ...prev, [previousSet.id]: false }));
    setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setCompletedBySetId((prev) => ({ ...prev, [currentSet.id]: true }));
    if (canGoNext) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleCheckbox = () => {
    setCompletedBySetId((prev) => ({ ...prev, [currentSet.id]: !prev[currentSet.id] }));
  };

  return (
    <View style={[styles.screen, { backgroundColor: palette.page }]}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>ANDROID NOTIFICATION LAB</Text>
      <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
        Preview visual do card Android (mock temporario).
      </Text>

      {/* Card simulando notificação real do Android */}
      <View style={[styles.notifCard, { backgroundColor: "#1e1e1e" }]}>
        {/* Header: ícone + app name */}
        <View style={styles.notifHeader}>
          <View style={styles.notifIcon}>
            <Text style={styles.notifIconText}>G</Text>
          </View>
          <Text style={styles.notifAppName}>Gym Log</Text>
          <Text style={styles.notifTime}>agora</Text>
        </View>

        {/* Título + corpo */}
        <Text style={styles.notifTitle}>{currentSet.exerciseName}</Text>
        <Text style={styles.notifBody}>
          {labels.bodyPattern(
            currentSet.setIndex,
            currentSet.totalSets,
            String(currentSet.weight),
            currentSet.reps,
          )}
        </Text>

        {/* Divisor */}
        <View style={styles.notifDivider} />

        {/* Botões de ação — exatamente como o Android renderiza */}
        <View style={styles.notifActions}>
          <Pressable
            style={[styles.notifActionBtn, !canGoBack && styles.notifActionBtnDisabled]}
            onPress={handleBack}
          >
            <Text style={[styles.notifActionText, !canGoBack && styles.notifActionTextDisabled]}>
              {labels.back.toUpperCase()}
            </Text>
          </Pressable>

          <View style={styles.notifActionSep} />

          <Pressable style={styles.notifActionBtn} onPress={handleNext}>
            <Text style={styles.notifActionText}>{labels.next.toUpperCase()}</Text>
          </Pressable>

          <View style={styles.notifActionSep} />

          <Pressable style={styles.notifActionBtn} onPress={handleCheckbox}>
            <Text style={[styles.notifActionText, currentChecked && styles.notifActionTextChecked]}>
              {currentChecked
                ? `✓ ${labels.complete.toUpperCase()}`
                : labels.complete.toUpperCase()}
            </Text>
          </Pressable>

          <View style={styles.notifActionSep} />

          <Pressable style={styles.notifActionBtn}>
            <Text style={[styles.notifActionText, { color: palette.accent }]}>
              {labels.open.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.note, { color: palette.textSecondary }]}>
        Progresso do mock: {currentIndex + 1}/{LAB_WORKOUT_SETS.length} séries
      </Text>
      <Text style={[styles.note, { color: palette.textSecondary }]}>
        Nota: cores/fontes do sistema Android podem variar por aparelho e tema.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  title: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: monoFont,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  // --- Estilos do card simulando notificação Android real ---
  notifCard: {
    marginTop: 6,
    borderRadius: 12,
    paddingTop: 12,
    paddingHorizontal: 14,
    paddingBottom: 0,
    elevation: 4,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  notifIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  notifIconText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  notifAppName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#aaa",
    flex: 1,
  },
  notifTime: {
    fontSize: 10,
    color: "#666",
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f0f0f0",
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 10,
  },
  notifDivider: {
    height: 1,
    backgroundColor: "#333",
    marginHorizontal: -14,
  },
  notifActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifActionBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  notifActionBtnDisabled: {
    opacity: 0.35,
  },
  notifActionSep: {
    width: 1,
    height: 16,
    backgroundColor: "#333",
  },
  notifActionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ccc",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  notifActionTextDisabled: {
    color: "#555",
  },
  notifActionTextChecked: {
    color: "#4ade80",
  },
  note: {
    marginTop: 6,
    fontFamily: monoFont,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
