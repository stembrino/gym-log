import { AppCard } from "@/components/AppCard";
import { ExpandedPanel } from "@/components/ExpandedPanel";
import { monoFont } from "@/constants/retroTheme";
import { HeaderActionButton } from "@/features/routines/components/HeaderActionButton";
import type { RoutineGroup } from "@/features/routines/hooks/useRoutineGroups";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RoutineGroupDetailCardProps = {
  group: RoutineGroup;
  expandedRoutineIds: Record<string, boolean>;
  onToggleRoutine: (routineId: string) => void;
  onToggleGroupFavorite: (groupId: string) => void;
  onEditGroup: (groupId: string) => void;
  onDeleteGroup: (groupId: string, groupName: string) => void;
  onEditRoutine: (routineId: string) => void;
  onDeleteRoutine: (routineId: string, routineName: string) => void;
  palette: {
    textPrimary: string;
    textSecondary: string;
    accent: string;
    border: string;
    card: string;
    listSelected: string;
  };
  t: (key: string) => string;
};

export function RoutineGroupDetailCard({
  group,
  expandedRoutineIds,
  onToggleRoutine,
  onToggleGroupFavorite,
  onEditGroup,
  onDeleteGroup,
  onEditRoutine,
  onDeleteRoutine,
  palette,
  t,
}: RoutineGroupDetailCardProps) {
  return (
    <AppCard style={styles.groupCard}>
      <View style={styles.groupHeaderRow}>
        <View style={styles.groupHeaderCopy}>
          <View style={styles.groupTitleRow}>
            <Text style={[styles.groupTitle, { color: palette.textPrimary }]}>{group.name}</Text>
            <View style={styles.actionRow}>
              <HeaderActionButton
                label={t("routines.editAction")}
                onPress={() => onEditGroup(group.id)}
                palette={palette}
              />
              <HeaderActionButton
                label={t("routines.deleteAction")}
                onPress={() => onDeleteGroup(group.id, group.name)}
                palette={palette}
              />
            </View>
          </View>

          {group.detail ? (
            <Text style={[styles.groupSubtitle, { color: palette.textSecondary }]}>
              {group.detail}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => {
            onToggleGroupFavorite(group.id);
          }}
          style={[
            styles.favoriteButton,
            {
              borderColor: "transparent",
              backgroundColor: "transparent",
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            group.isFavorite ? t("routines.unfavoriteGroup") : t("routines.favoriteGroup")
          }
          accessibilityHint={t("routines.favoriteGroupHint")}
        >
          <Text
            style={[
              styles.favoriteButtonText,
              {
                color: group.isFavorite ? palette.accent : palette.textSecondary,
              },
            ]}
          >
            {group.isFavorite ? "★" : "☆"}
          </Text>
        </Pressable>
      </View>

      {group.routines.length === 0 ? (
        <Text style={[styles.emptyState, { color: palette.textSecondary }]}>
          {t("routines.emptyGroupFilterRoutines")}
        </Text>
      ) : (
        <View style={styles.groupRoutinesList}>
          {group.routines.map((routine) => (
            <ExpandedPanel
              key={`${group.id}-${routine.id}`}
              title={routine.name}
              subtitle={routine.detail ?? ""}
              count={routine.exercises.length}
              expanded={Boolean(expandedRoutineIds[routine.id])}
              onToggle={() => onToggleRoutine(routine.id)}
              headerAction={
                <View style={styles.actionRow}>
                  <HeaderActionButton
                    label={t("routines.editAction")}
                    onPress={() => onEditRoutine(routine.id)}
                    palette={palette}
                  />
                  <HeaderActionButton
                    label={t("routines.deleteAction")}
                    onPress={() => onDeleteRoutine(routine.id, routine.name)}
                    palette={palette}
                  />
                </View>
              }
              style={[styles.groupRoutinePanel, { borderColor: palette.border }]}
            >
              <View style={styles.exerciseList}>
                {routine.exercises.map((exercise) => (
                  <View key={exercise.id} style={styles.exerciseRow}>
                    <Text style={[styles.exerciseIndex, { color: palette.accent }]}>
                      {String(exercise.exerciseOrder).padStart(2, "0")}
                    </Text>
                    <View style={styles.exerciseCopy}>
                      <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.exerciseMeta, { color: palette.textSecondary }]}>
                        {exercise.setsTarget ?? "-"} x {exercise.repsTarget ?? "-"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {routine.description ? (
                <Text style={[styles.groupRoutineDescription, { color: palette.textSecondary }]}>
                  {routine.description}
                </Text>
              ) : null}
            </ExpandedPanel>
          ))}
        </View>
      )}

      {group.description ? (
        <>
          <View style={[styles.sectionDivider, { backgroundColor: palette.border }]} />
          <Text style={[styles.descriptionBlock, { color: palette.textSecondary }]}>
            {group.description}
          </Text>
        </>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  groupCard: {
    gap: 12,
  },
  groupHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  groupHeaderCopy: {
    flex: 1,
    gap: 8,
  },
  groupTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    minHeight: 32,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  groupTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontFamily: monoFont,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  groupSubtitle: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
  },
  favoriteButton: {
    minHeight: 32,
    minWidth: 32,
    paddingHorizontal: 2,
    paddingBlock: 0,
    paddingBottom: 4,
    borderWidth: 0,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonText: {
    fontFamily: monoFont,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  emptyState: {
    marginTop: 16,
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
  },
  groupRoutinesList: {
    gap: 8,
  },
  groupRoutinePanel: {
    gap: 0,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  exerciseIndex: {
    width: 24,
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  exerciseCopy: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  exerciseMeta: {
    fontFamily: monoFont,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  groupRoutineDescription: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  sectionDivider: {
    height: 1,
  },
  descriptionBlock: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
});
