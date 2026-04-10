import { useRetroPalette } from "@/components/hooks/useRetroPalette";
import { useI18n } from "@/components/providers/i18n-provider";
import { monoFont } from "@/constants/retroTheme";
import { DEFAULT_ROUTINE_TAGS } from "@/constants/seed/routineTags";
import {
  usePaginatedExerciseLibrary,
  type ExerciseLibraryItem,
} from "@/features/routines/hooks/usePaginatedExerciseLibrary";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CreateRoutineModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (routineData: {
    name: string;
    estimatedDurationMin?: number;
    tagIds: string[];
    exercises: {
      exerciseId: string;
      exerciseOrder: number;
      setsTarget?: number;
      repsTarget?: number;
    }[];
  }) => void;
}

type Screen = "basic" | "exercises";

type SelectedRoutineExercise = {
  exerciseId: string;
  name: string;
  i18nKey: string | null;
  exerciseOrder: number;
  setsTarget: string;
  repsTarget: string;
};

export function CreateRoutineModal({ visible, onClose, onSubmit }: CreateRoutineModalProps) {
  const { t, locale } = useI18n();
  const palette = useRetroPalette();

  const [screen, setScreen] = useState<Screen>("basic");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<SelectedRoutineExercise[]>([]);

  const excludedExerciseIds = useMemo(
    () => selectedExercises.map((exercise) => exercise.exerciseId),
    [selectedExercises],
  );

  const getExerciseLabel = useCallback(
    (exercise: { i18nKey: string | null; name: string }) =>
      exercise.i18nKey ? t(`exerciseLibrary.${exercise.i18nKey}`) : exercise.name,
    [t],
  );

  const {
    items: pagedExercises,
    hasMore: hasMoreExercises,
    loadingInitial: loadingInitialExercises,
    loadingMore: loadingMoreExercises,
    loadMore: handleLoadMoreExercises,
  } = usePaginatedExerciseLibrary({
    query: searchQuery,
    locale,
    excludeIds: excludedExerciseIds,
  });

  const handleToggleTag = (tagId: string) => {
    setSelectedTags((prev) => {
      const updated = new Set(prev);
      if (updated.has(tagId)) {
        updated.delete(tagId);
      } else {
        updated.add(tagId);
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (!name.trim()) {
      return;
    }
    setScreen("exercises");
  };

  const handleBack = () => {
    setScreen("basic");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }

    const parsedDuration = duration ? parseInt(duration, 10) : undefined;

    onSubmit({
      name: name.trim(),
      estimatedDurationMin:
        typeof parsedDuration === "number" && Number.isFinite(parsedDuration)
          ? parsedDuration
          : undefined,
      tagIds: Array.from(selectedTags),
      exercises: selectedExercises.map((exercise) => {
        const parsedSets = parseInt(exercise.setsTarget, 10);
        const parsedReps = parseInt(exercise.repsTarget, 10);

        return {
          exerciseId: exercise.exerciseId,
          exerciseOrder: exercise.exerciseOrder,
          setsTarget: Number.isFinite(parsedSets) ? parsedSets : undefined,
          repsTarget: Number.isFinite(parsedReps) ? parsedReps : undefined,
        };
      }),
    });

    setName("");
    setDuration("");
    setSelectedTags(new Set());
    setSelectedExercises([]);
    setSearchQuery("");
    setScreen("basic");
  };

  const handleAddExercise = (exercise: ExerciseLibraryItem) => {
    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        i18nKey: exercise.i18nKey,
        exerciseOrder: prev.length + 1,
        setsTarget: "3",
        repsTarget: "10",
      },
    ]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev
        .filter((exercise) => exercise.exerciseId !== exerciseId)
        .map((exercise, index) => ({ ...exercise, exerciseOrder: index + 1 })),
    );
  };

  const handleUpdateExerciseField = (
    exerciseId: string,
    field: "setsTarget" | "repsTarget",
    value: string,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((exercise) =>
        exercise.exerciseId === exerciseId ? { ...exercise, [field]: value } : exercise,
      ),
    );
  };

  const handleModalClose = () => {
    setName("");
    setDuration("");
    setSelectedTags(new Set());
    setSelectedExercises([]);
    setSearchQuery("");
    setScreen("basic");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleModalClose}
    >
      <View style={[styles.container, { backgroundColor: palette.page }]}>
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <TouchableOpacity onPress={handleModalClose}>
            <Text style={[styles.closeButton, { color: palette.textPrimary }]}>✕</Text>
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
            {screen === "basic" ? t("routines.createRoutine") : t("routines.addExercises")}
          </Text>

          <Text style={[styles.stepIndicator, { color: palette.textSecondary }]}>
            {screen === "basic" ? "1/2" : "2/2"}
          </Text>
        </View>

        {screen === "basic" ? (
          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
            <View style={styles.screen}>
              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textPrimary }]}>
                  {t("routines.formNameLabel")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: palette.border,
                      color: palette.textPrimary,
                      backgroundColor: palette.card,
                    },
                  ]}
                  placeholder={t("routines.formNamePlaceholder")}
                  placeholderTextColor={palette.textSecondary}
                  value={name}
                  onChangeText={setName}
                  maxLength={50}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textPrimary }]}>
                  {t("routines.formDurationLabel")}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: palette.border,
                      color: palette.textPrimary,
                      backgroundColor: palette.card,
                    },
                  ]}
                  placeholder={t("routines.formDurationPlaceholder")}
                  placeholderTextColor={palette.textSecondary}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: palette.textPrimary }]}>
                  {t("routines.formTagsLabel")}
                </Text>
                <View style={styles.tagList}>
                  {DEFAULT_ROUTINE_TAGS.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagOption,
                        {
                          borderColor: palette.border,
                          backgroundColor: selectedTags.has(tag.id) ? palette.accent : palette.card,
                        },
                      ]}
                      onPress={() => handleToggleTag(tag.id)}
                    >
                      <Text
                        style={[
                          styles.tagOptionText,
                          {
                            color: selectedTags.has(tag.id) ? palette.card : palette.textPrimary,
                          },
                        ]}
                      >
                        {selectedTags.has(tag.id) ? "✓" : "○"} {t(`routines.tags.${tag.i18nKey}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.exercisesScreen}>
            <Text style={[styles.screenHint, { color: palette.textSecondary }]}>
              {t("routines.addExercisesHint")}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  borderColor: palette.border,
                  color: palette.textPrimary,
                  backgroundColor: palette.card,
                },
              ]}
              placeholder={t("routines.searchExercisePlaceholder")}
              placeholderTextColor={palette.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              {t("routines.selectedExercisesTitle")}
            </Text>

            {selectedExercises.length === 0 ? (
              <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                {t("routines.selectedExercisesEmpty")}
              </Text>
            ) : (
              <View style={styles.selectedList}>
                {selectedExercises.map((exercise) => (
                  <View
                    key={exercise.exerciseId}
                    style={[
                      styles.selectedCard,
                      { borderColor: palette.border, backgroundColor: palette.card },
                    ]}
                  >
                    <View style={styles.selectedHeaderRow}>
                      <Text style={[styles.selectedExerciseTitle, { color: palette.textPrimary }]}>
                        {exercise.exerciseOrder}. {getExerciseLabel(exercise)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(exercise.exerciseId)}
                        style={[styles.removeButton, { borderColor: palette.border }]}
                      >
                        <Text style={[styles.removeButtonText, { color: palette.textPrimary }]}>
                          {t("routines.removeExerciseButton")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.selectedFieldsRow}>
                      <TextInput
                        style={[
                          styles.smallInput,
                          {
                            borderColor: palette.border,
                            color: palette.textPrimary,
                            backgroundColor: palette.page,
                          },
                        ]}
                        placeholder={t("routines.setsPlaceholder")}
                        placeholderTextColor={palette.textSecondary}
                        value={exercise.setsTarget}
                        onChangeText={(value) =>
                          handleUpdateExerciseField(exercise.exerciseId, "setsTarget", value)
                        }
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                      <TextInput
                        style={[
                          styles.smallInput,
                          {
                            borderColor: palette.border,
                            color: palette.textPrimary,
                            backgroundColor: palette.page,
                          },
                        ]}
                        placeholder={t("routines.repsPlaceholder")}
                        placeholderTextColor={palette.textSecondary}
                        value={exercise.repsTarget}
                        onChangeText={(value) =>
                          handleUpdateExerciseField(exercise.exerciseId, "repsTarget", value)
                        }
                        keyboardType="number-pad"
                        maxLength={3}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              {t("routines.availableExercisesTitle")}
            </Text>

            <FlatList
              data={pagedExercises}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.catalogList}
              keyboardShouldPersistTaps="handled"
              onEndReached={handleLoadMoreExercises}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
                  {loadingInitialExercises
                    ? t("routines.loading")
                    : t("routines.noExerciseResults")}
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
                    onPress={() => handleAddExercise(item)}
                  >
                    <Text style={[styles.addExerciseButtonText, { color: palette.card }]}>
                      {t("routines.addExerciseButton")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        <View style={[styles.footer, { borderTopColor: palette.border }]}>
          {screen === "basic" && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { borderColor: palette.border }]}
                onPress={handleModalClose}
              >
                <Text style={[styles.buttonText, { color: palette.textPrimary }]}>
                  {t("routines.cancelButton")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: palette.accent }]}
                onPress={handleNext}
                disabled={!name.trim()}
              >
                <Text style={[styles.buttonText, { color: palette.card }]}>
                  {t("routines.nextButton")} →
                </Text>
              </TouchableOpacity>
            </>
          )}

          {screen === "exercises" && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton, { borderColor: palette.border }]}
                onPress={handleBack}
              >
                <Text style={[styles.buttonText, { color: palette.textPrimary }]}>
                  ← {t("routines.backButton")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: palette.accent }]}
                onPress={handleCreate}
              >
                <Text style={[styles.buttonText, { color: palette.card }]}>
                  {t("routines.createButton")} ✓
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: monoFont,
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  closeButton: {
    fontSize: 24,
    padding: 8,
  },
  stepIndicator: {
    fontFamily: monoFont,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
    gap: 20,
  },
  exercisesScreen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  screen: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: monoFont,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: monoFont,
    fontSize: 14,
  },
  tagList: {
    gap: 8,
  },
  tagOption: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tagOptionText: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  screenHint: {
    fontFamily: monoFont,
    fontSize: 12,
    letterSpacing: 0.2,
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
  selectedFieldsRow: {
    flexDirection: "row",
    gap: 8,
  },
  smallInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: monoFont,
    fontSize: 13,
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
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  button: {
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButton: {
    flex: 1,
  },
  buttonText: {
    fontFamily: monoFont,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
