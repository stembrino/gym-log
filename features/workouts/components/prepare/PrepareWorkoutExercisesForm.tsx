import { AvatarWithPreview } from "@/components/AvatarWithPreview";
import { RoundAddButton } from "@/components/RoundAddButton";
import { monoFont } from "@/constants/retroTheme";
import { resolveExerciseImageSource } from "@/features/exercises/utils/exerciseImageSource";
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from "react-native-draggable-flatlist";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export type EditableWorkoutExercise = {
  id: string;
  exerciseId?: string;
  name: string;
  exerciseOrder: number;
  setRepsTargets: string[];
};

type PrepareWorkoutExercisesFormProps = {
  items: EditableWorkoutExercise[];
  addButtonAccessibilityLabel: string;
  removeExerciseButtonLabel: string;
  addSetButtonLabel: string;
  removeSetButtonAccessibilityLabel: string;
  setLabel: string;
  repsPlaceholder: string;
  repsSuffix: string;
  palette: {
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    page: string;
    listSelected: string;
  };
  onReorder: (nextItems: EditableWorkoutExercise[]) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onAddExerciseSet: (exerciseId: string) => void;
  onRemoveExerciseSet: (exerciseId: string, setIndex: number) => void;
  onUpdateExerciseSetReps: (exerciseId: string, setIndex: number, value: string) => void;
  onPressAddExercise: () => void;
};

export function PrepareWorkoutExercisesForm({
  items,
  addButtonAccessibilityLabel,
  removeExerciseButtonLabel,
  addSetButtonLabel,
  removeSetButtonAccessibilityLabel,
  setLabel,
  repsPlaceholder,
  repsSuffix,
  palette,
  onReorder,
  onRemoveExercise,
  onAddExerciseSet,
  onRemoveExerciseSet,
  onUpdateExerciseSetReps,
  onPressAddExercise,
}: PrepareWorkoutExercisesFormProps) {
  const renderItem = ({ item, drag, isActive }: RenderItemParams<EditableWorkoutExercise>) => {
    const imageSource = resolveExerciseImageSource(item.exerciseId ?? item.id, null);

    return (
      <ScaleDecorator>
        <Pressable
          onLongPress={drag}
          delayLongPress={120}
          style={[
            styles.exerciseRow,
            {
              borderColor: palette.border,
              backgroundColor: isActive ? palette.listSelected : palette.card,
            },
          ]}
        >
          <View style={styles.dragHandle}>
            <Text style={[styles.dragHandleText, { color: palette.textSecondary }]}>::</Text>
          </View>

          <AvatarWithPreview
            label={item.name}
            size="md"
            imageSource={imageSource}
            previewTitle={item.name}
          />

          <Text style={[styles.exerciseOrder, { color: palette.accent }]}>
            {item.exerciseOrder}.
          </Text>

          <View style={styles.exerciseCopy}>
            <Text style={[styles.exerciseName, { color: palette.textPrimary }]}>{item.name}</Text>
            <View style={styles.setsList}>
              {item.setRepsTargets.map((repsTarget, setIndex) => (
                <View key={`${item.id}-${setIndex + 1}`} style={styles.setRow}>
                  <View
                    style={[
                      styles.setBadge,
                      { borderColor: palette.border, backgroundColor: palette.page },
                    ]}
                  >
                    <Text style={[styles.setBadgeText, { color: palette.textSecondary }]}>
                      {setIndex + 1}
                    </Text>
                  </View>
                  <TextInput
                    style={[
                      styles.smallInput,
                      {
                        borderColor: palette.border,
                        color: palette.textPrimary,
                        backgroundColor: palette.page,
                      },
                    ]}
                    value={repsTarget}
                    onChangeText={(value) => onUpdateExerciseSetReps(item.id, setIndex, value)}
                    placeholder={repsPlaceholder}
                    placeholderTextColor={palette.textSecondary}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Text style={[styles.repsSuffix, { color: palette.textSecondary }]}>
                    {repsSuffix}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeSetButton}
                    onPress={() => onRemoveExerciseSet(item.id, setIndex)}
                    disabled={item.setRepsTargets.length <= 1}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={removeSetButtonAccessibilityLabel}
                  >
                    <FontAwesome
                      name="trash-o"
                      size={15}
                      color={
                        item.setRepsTargets.length <= 1
                          ? `${palette.textSecondary}66`
                          : palette.textSecondary
                      }
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.addSetButton, { borderColor: palette.border }]}
                onPress={() => onAddExerciseSet(item.id)}
              >
                <Text style={[styles.addSetButtonText, { color: palette.textPrimary }]}>
                  + {addSetButtonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveExercise(item.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={removeExerciseButtonLabel}
          >
            <FontAwesome name="times" size={16} color={palette.textSecondary} />
          </TouchableOpacity>
        </Pressable>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => onReorder(data)}
        activationDistance={12}
        removeClippedSubviews={false}
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          <View style={styles.addFooter}>
            <RoundAddButton
              size="small"
              accessibilityLabel={addButtonAccessibilityLabel}
              onPress={onPressAddExercise}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    gap: 8,
  },
  listContainer: {
    flex: 1,
    minHeight: 0,
  },
  listContent: {
    paddingBottom: 6,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  dragHandle: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  dragHandleText: {
    fontFamily: monoFont,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  exerciseOrder: {
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "700",
    width: 24,
    textAlign: "right",
    letterSpacing: 0.2,
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  exerciseName: {
    fontFamily: monoFont,
    fontSize: 11,
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
  smallInput: {
    width: 68,
    height: 34,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontFamily: monoFont,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  repsSuffix: {
    fontFamily: monoFont,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  removeSetButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
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
    fontWeight: "600",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  addFooter: {
    paddingTop: 2,
    paddingBottom: 8,
    alignItems: "center",
  },
});
