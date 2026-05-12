import { ControlledSearchInput } from "@/components/ControlledSearchInput";
import { AvatarWithPreview } from "@/components/AvatarWithPreview";
import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import { monoFont } from "@/constants/retroTheme";
import type { ExerciseLibraryItem } from "@/features/exercises/hooks/usePaginatedExerciseLibrary";
import { resolveExerciseImageSource } from "@/features/exercises/utils/exerciseImageSource";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { SelectedRoutineExercise } from "./types";

type Palette = ReturnType<typeof useRetroPalette>;
type TFn = ReturnType<typeof useI18n>["t"];

export type ExercisePickerScreenProps = {
  searchQuery: string;
  onChangeSearchQuery: (v: string) => void;
  selectedExercises: SelectedRoutineExercise[];
  onRemoveExercise: (id: string) => void;
  onUpdateExerciseSetReps: (id: string, setIndex: number, value: string) => void;
  onAddExerciseSet: (id: string) => void;
  onRemoveExerciseSet: (id: string, setIndex: number) => void;
  getExerciseLabel: (e: { name: string }) => string;
  pagedExercises: ExerciseLibraryItem[];
  hasMoreExercises: boolean;
  loadingInitialExercises: boolean;
  loadingMoreExercises: boolean;
  onLoadMoreExercises: () => void;
  onAddExercise: (e: ExerciseLibraryItem) => void;
  palette: Palette;
  t: TFn;
  showCreateExerciseButton?: boolean;
  onCreateExercisePress?: () => void;
};

export function ExercisePickerScreen({
  searchQuery,
  onChangeSearchQuery,
  selectedExercises,
  onRemoveExercise,
  onUpdateExerciseSetReps,
  onAddExerciseSet,
  onRemoveExerciseSet,
  getExerciseLabel,
  pagedExercises,
  hasMoreExercises,
  loadingInitialExercises,
  loadingMoreExercises,
  onLoadMoreExercises,
  onAddExercise,
  palette,
  t,
  showCreateExerciseButton = false,
  onCreateExercisePress,
}: ExercisePickerScreenProps) {
  const selectedExercisesList = useMemo(
    () =>
      (Array.isArray(selectedExercises) ? selectedExercises : []).filter(
        (exercise): exercise is SelectedRoutineExercise =>
          Boolean(exercise?.exerciseId && exercise?.name),
      ),
    [selectedExercises],
  );

  return (
    <FlatList
      data={pagedExercises}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.exercisesContent}
      keyboardShouldPersistTaps="handled"
      onEndReached={onLoadMoreExercises}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={
        <View style={styles.headerContent}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            {t("routines.selectedExercisesTitle")}
          </Text>

          {selectedExercisesList.length === 0 ? (
            <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
              {t("routines.selectedExercisesEmpty")}
            </Text>
          ) : (
            <View style={[styles.selectedList, { borderColor: palette.border }]}>
              {selectedExercisesList.map((exercise, index) => (
                <View
                  key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${index}`}
                  style={[
                    styles.selectedCard,
                    { borderColor: palette.border, backgroundColor: palette.card },
                  ]}
                >
                  <View style={styles.selectedHeaderRow}>
                    <Text style={[styles.selectedExerciseTitle, { color: palette.accent }]}>
                      {exercise.exerciseOrder}. {getExerciseLabel(exercise)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onRemoveExercise(exercise.exerciseId)}
                      style={[styles.removeButton, { borderColor: palette.border }]}
                    >
                      <Text style={[styles.removeButtonText, { color: palette.textPrimary }]}>
                        {t("routines.removeExerciseButton")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.setsList}>
                    {exercise.setRepsTargets.map((setRepsTarget, setIndex) => (
                      <View
                        key={`${exercise.exerciseId}-set-${setIndex + 1}`}
                        style={styles.setRow}
                      >
                        <View
                          style={[
                            styles.setBadge,
                            {
                              borderColor: palette.border,
                              backgroundColor: palette.page,
                            },
                          ]}
                        >
                          <Text style={[styles.setBadgeText, { color: palette.textSecondary }]}>
                            {setIndex + 1}
                          </Text>
                        </View>
                        <TextInput
                          style={[
                            styles.repsInput,
                            {
                              borderColor: palette.border,
                              color: palette.textPrimary,
                              backgroundColor: palette.page,
                            },
                          ]}
                          placeholder={t("routines.repsPlaceholder")}
                          placeholderTextColor={palette.textSecondary}
                          value={setRepsTarget}
                          onChangeText={(value) =>
                            onUpdateExerciseSetReps(exercise.exerciseId, setIndex, value)
                          }
                          keyboardType="number-pad"
                          maxLength={3}
                        />
                        <Text style={[styles.repsUnit, { color: palette.textSecondary }]}>
                          {t("workouts.repsUnitSuffix")}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeSetButton}
                          onPress={() => onRemoveExerciseSet(exercise.exerciseId, setIndex)}
                          disabled={exercise.setRepsTargets.length <= 1}
                          accessibilityRole="button"
                          accessibilityLabel={t("workouts.removeSetAccessibilityLabel")}
                        >
                          <FontAwesome
                            name="trash-o"
                            size={14}
                            color={
                              exercise.setRepsTargets.length <= 1
                                ? `${palette.textSecondary}66`
                                : palette.textSecondary
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[styles.addSetButton, { borderColor: palette.border }]}
                      onPress={() => onAddExerciseSet(exercise.exerciseId)}
                    >
                      <Text style={[styles.addSetButtonText, { color: palette.textPrimary }]}>
                        + {t("workouts.addSetAccessibilityLabel")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            {t("routines.availableExercisesTitle")}
          </Text>

          <ControlledSearchInput
            value={searchQuery}
            onChangeText={onChangeSearchQuery}
            placeholder={t("routines.searchExercisePlaceholder")}
            variant="compact"
          />

          {showCreateExerciseButton ? (
            <TouchableOpacity
              style={[styles.createExerciseButton, { borderColor: palette.border }]}
              onPress={onCreateExercisePress}
            >
              <Text style={[styles.createExerciseButtonText, { color: palette.textPrimary }]}>
                + {t("exercises.createExercise")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
          {loadingInitialExercises ? t("routines.loading") : t("routines.noExerciseResults")}
        </Text>
      }
      ListFooterComponent={
        loadingMoreExercises ? (
          <Text style={[styles.paginationHint, { color: palette.textSecondary }]}>
            {t("routines.loading")}
          </Text>
        ) : hasMoreExercises ? (
          <Text style={[styles.paginationHint, { color: palette.textSecondary }]}>...</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View
          style={[
            styles.catalogItem,
            { borderColor: palette.border, backgroundColor: palette.card },
          ]}
        >
          <AvatarWithPreview
            label={getExerciseLabel(item)}
            size="lg"
            imageSource={resolveExerciseImageSource(item.id, item.imageUrl ?? null)}
            previewTitle={getExerciseLabel(item)}
          />
          <View style={styles.catalogCopy}>
            <Text style={[styles.catalogTitle, { color: palette.textPrimary }]}>
              {getExerciseLabel(item)}
            </Text>
            <Text style={[styles.catalogMeta, { color: palette.textSecondary }]}>
              {item.muscleGroup}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addExerciseButton, { backgroundColor: palette.accent }]}
            onPress={() => onAddExercise(item)}
          >
            <Text style={[styles.addExerciseButtonText, { color: palette.onAccent }]}>
              {t("routines.addExerciseButton")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  exercisesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  headerContent: {
    gap: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    marginTop: 4,
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  emptyText: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
  },
  selectedList: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    gap: 8,
  },
  selectedCard: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    gap: 10,
  },
  selectedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectedExerciseTitle: {
    flex: 1,
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  setsList: {
    gap: 6,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setBadge: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  setBadgeText: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
    lineHeight: 12,
  },
  repsInput: {
    width: 68,
    height: 34,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontFamily: monoFont,
    fontSize: 12,
    textAlign: "center",
  },
  repsUnit: {
    fontFamily: monoFont,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  removeSetButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActionsRow: {
    marginTop: 2,
    alignItems: "flex-start",
  },
  addSetButton: {
    minHeight: 30,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  addSetButtonText: {
    fontFamily: monoFont,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  removeButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeButtonText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  catalogList: {
    gap: 8,
    paddingBottom: 8,
  },
  paginationHint: {
    paddingVertical: 6,
    textAlign: "center",
    fontFamily: monoFont,
    fontSize: 12,
    letterSpacing: 0.2,
  },
  catalogItem: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  catalogCopy: {
    flex: 1,
    gap: 2,
  },
  catalogTitle: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  catalogMeta: {
    fontFamily: monoFont,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  addExerciseButton: {
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  addExerciseButtonText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  createExerciseButton: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  createExerciseButtonText: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
