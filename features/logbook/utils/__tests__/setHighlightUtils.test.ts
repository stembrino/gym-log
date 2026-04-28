import { getHighlightedSetIds, getHighlightedSetIdsForFilteredItems } from "../setHighlightUtils";
import type { LogbookWorkoutItem } from "@/features/logbook/dao/queries/logbookQueries";

describe("getHighlightedSetIds", () => {
  it("should return empty set for empty input", () => {
    const result = getHighlightedSetIds([]);
    expect(result.size).toBe(0);
  });

  it("should highlight single set", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Legpress", weight: 80, reps: 10, setOrder: 1, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("1")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("should highlight set with maximum weight", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Legpress", weight: 80, reps: 10, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Legpress", weight: 100, reps: 10, setOrder: 2, completed: true },
      { id: "3", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 3, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("2")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("should highlight set with most reps when weight is same", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Legpress", weight: 90, reps: 8, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 2, completed: true },
      { id: "3", exerciseName: "Legpress", weight: 90, reps: 6, setOrder: 3, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("2")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("should highlight last set when weight and reps are identical", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 2, completed: true },
      { id: "3", exerciseName: "Legpress", weight: 90, reps: 6, setOrder: 3, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("2")).toBe(true);
    expect(result.size).toBe(1);
  });

  it("should highlight best set per exercise for multiple exercises", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Legpress", weight: 80, reps: 10, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Legpress", weight: 100, reps: 10, setOrder: 2, completed: true },
      { id: "3", exerciseName: "Squats", weight: 60, reps: 8, setOrder: 1, completed: true },
      { id: "4", exerciseName: "Squats", weight: 60, reps: 12, setOrder: 2, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("2")).toBe(true); // Legpress: 100kg
    expect(result.has("4")).toBe(true); // Squats: 12 reps at 60kg
    expect(result.size).toBe(2);
  });

  it("should prioritize weight over reps", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      { id: "1", exerciseName: "Benchpress", weight: 100, reps: 5, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Benchpress", weight: 80, reps: 15, setOrder: 2, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("1")).toBe(true); // Higher weight wins
    expect(result.size).toBe(1);
  });

  it("should handle complex multi-exercise scenario", () => {
    const setDetails: LogbookWorkoutItem["setDetails"] = [
      // Legpress: 10x90, 10x90, 6x90 -> should highlight 2nd (last with 10x90)
      { id: "1", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 1, completed: true },
      { id: "2", exerciseName: "Legpress", weight: 90, reps: 10, setOrder: 2, completed: true },
      { id: "3", exerciseName: "Legpress", weight: 90, reps: 6, setOrder: 3, completed: true },
      // Squats: 8x70, 8x70 -> should highlight 2nd (last)
      { id: "4", exerciseName: "Squats", weight: 70, reps: 8, setOrder: 1, completed: true },
      { id: "5", exerciseName: "Squats", weight: 70, reps: 8, setOrder: 2, completed: true },
    ];
    const result = getHighlightedSetIds(setDetails);
    expect(result.has("2")).toBe(true); // Legpress
    expect(result.has("5")).toBe(true); // Squats
    expect(result.size).toBe(2);
  });
});

describe("getHighlightedSetIdsForFilteredItems", () => {
  it("should highlight only the top set per exercise across all filtered workouts", () => {
    const items: LogbookWorkoutItem[] = [
      {
        id: "w1",
        date: "2026-01-01T10:00:00.000Z",
        createdAt: "2026-01-01T10:00:00.000Z",
        duration: 45,
        sourceRoutine: null,
        gym: null,
        exerciseCount: 1,
        totalSets: 2,
        completedSets: 2,
        totalLoadKg: 1400,
        setDetails: [
          {
            id: "s1",
            exerciseName: "Benchpress",
            setOrder: 1,
            reps: 10,
            weight: 70,
            completed: true,
          },
          {
            id: "s2",
            exerciseName: "Benchpress",
            setOrder: 2,
            reps: 8,
            weight: 75,
            completed: true,
          },
        ],
      },
      {
        id: "w2",
        date: "2026-01-03T10:00:00.000Z",
        createdAt: "2026-01-03T10:00:00.000Z",
        duration: 50,
        sourceRoutine: null,
        gym: null,
        exerciseCount: 2,
        totalSets: 3,
        completedSets: 3,
        totalLoadKg: 2050,
        setDetails: [
          {
            id: "s3",
            exerciseName: "Benchpress",
            setOrder: 1,
            reps: 6,
            weight: 80,
            completed: true,
          },
          {
            id: "s4",
            exerciseName: "Squat",
            setOrder: 1,
            reps: 5,
            weight: 100,
            completed: true,
          },
          {
            id: "s5",
            exerciseName: "Squat",
            setOrder: 2,
            reps: 6,
            weight: 100,
            completed: true,
          },
        ],
      },
    ];

    const result = getHighlightedSetIdsForFilteredItems(items);

    expect(result.has("s3")).toBe(true); // Benchpress global max = 80kg
    expect(result.has("s5")).toBe(true); // Squat tie on weight, higher reps wins
    expect(result.has("s2")).toBe(false);
    expect(result.has("s4")).toBe(false);
    expect(result.size).toBe(2);
  });
});
