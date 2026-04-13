import type { WorkoutRoutinePickerItem } from "@/features/workouts/hooks/useRoutinePicker";
import { monoFont } from "@/constants/retroTheme";
import { FlatList, StyleSheet, Text } from "react-native";
import { RoutinePickerListItem } from "./RoutinePickerListItem";

type RoutinePickerListProps = {
  items: WorkoutRoutinePickerItem[];
  loadingInitial: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  emptyLabel: string;
  loadingLabel: string;
  selectLabel: string;
  exercisesLabel: string;
  onSelect: (routine: WorkoutRoutinePickerItem) => void;
  onLoadMore: () => void;
  palette: {
    textSecondary: string;
  };
};

export function RoutinePickerList({
  items,
  loadingInitial,
  loadingMore,
  hasMore,
  emptyLabel,
  loadingLabel,
  selectLabel,
  exercisesLabel,
  onSelect,
  onLoadMore,
  palette,
}: RoutinePickerListProps) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: palette.textSecondary }]}>
          {loadingInitial ? loadingLabel : emptyLabel}
        </Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <Text style={[styles.footerText, { color: palette.textSecondary }]}>{loadingLabel}</Text>
        ) : hasMore ? (
          <Text style={[styles.footerText, { color: palette.textSecondary }]}>{"..."}</Text>
        ) : null
      }
      renderItem={({ item }) => (
        <RoutinePickerListItem
          item={item}
          onPress={onSelect}
          selectLabel={selectLabel}
          exercisesLabel={exercisesLabel}
        />
      )}
      ItemSeparatorComponent={() => <Text style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  separator: {
    height: 8,
  },
  emptyText: {
    fontFamily: monoFont,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 24,
  },
  footerText: {
    paddingVertical: 6,
    textAlign: "center",
    fontFamily: monoFont,
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
