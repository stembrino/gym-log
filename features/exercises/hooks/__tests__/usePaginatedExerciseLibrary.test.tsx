import { renderHook, waitFor } from "@testing-library/react-native";
import { usePaginatedExerciseLibrary } from "@/features/exercises/hooks/usePaginatedExerciseLibrary";

jest.mock("@/features/exercises/dao/queries/exerciseQueries", () => ({
  getExerciseLibraryCount: jest.fn(),
  getExerciseLibraryPage: jest.fn(),
}));

const mockGetExerciseLibraryCount = jest.requireMock(
  "@/features/exercises/dao/queries/exerciseQueries",
).getExerciseLibraryCount as jest.Mock;
const mockGetExerciseLibraryPage = jest.requireMock(
  "@/features/exercises/dao/queries/exerciseQueries",
).getExerciseLibraryPage as jest.Mock;

describe("usePaginatedExerciseLibrary", () => {
  beforeEach(() => {
    mockGetExerciseLibraryCount.mockReset();
    mockGetExerciseLibraryPage.mockReset();
  });

  it("loads initial items with translations from single joined query", async () => {
    mockGetExerciseLibraryCount.mockResolvedValue(2);
    mockGetExerciseLibraryPage.mockResolvedValue([
      {
        id: "ex-1",
        name: "Supino Reto",
        muscleGroup: "Chest",
        isCustom: true,
      },
      {
        id: "ex-2",
        name: "Row",
        muscleGroup: "Back",
        isCustom: false,
      },
    ]);

    const { result, unmount } = renderHook(() =>
      usePaginatedExerciseLibrary({
        query: "",
        locale: "pt-BR",
        excludeIds: [],
        muscleGroups: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]?.name).toBe("Supino Reto");
      expect(result.current.items[0]?.isCustom).toBe(true);
      expect(result.current.items[1]?.name).toBe("Row");
      expect(result.current.totalCount).toBe(2);
      expect(result.current.hasMore).toBe(false);
    });

    unmount();
  });
});
