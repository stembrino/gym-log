import { renderHook, waitFor } from "@testing-library/react-native";
import { usePaginatedExerciseLibrary } from "@/features/exercises/hooks/usePaginatedExerciseLibrary";

jest.mock("@/db/client", () => ({
  db: {
    select: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  exercises: {
    id: "id",
    name: "name",
    muscleGroup: "muscleGroup",
    isCustom: "isCustom",
    searchPt: "searchPt",
    searchEn: "searchEn",
  },
  entityTranslations: {
    entityId: "entityId",
    entityType: "entityType",
    field: "field",
    locale: "locale",
    value: "value",
  },
}));

jest.mock("drizzle-orm", () => ({
  and: (...conditions: unknown[]) => ({ op: "and", conditions }),
  asc: (column: unknown) => ({ op: "asc", column }),
  eq: (column: unknown, value: unknown) => ({ op: "eq", column, value }),
  inArray: (column: unknown, values: unknown) => ({ op: "inArray", column, values }),
  like: (column: unknown, value: unknown) => ({ op: "like", column, value }),
  notInArray: (column: unknown, values: unknown) => ({ op: "notInArray", column, values }),
  or: (...conditions: unknown[]) => ({ op: "or", conditions }),
}));

const mockDb = jest.requireMock("@/db/client").db as { select: jest.Mock };

type ExerciseRow = {
  id: string;
  name: string;
  muscleGroup: string;
  isCustom: boolean;
};

function createQueryBuilder(result: Promise<unknown> | unknown) {
  const resultPromise = Promise.resolve(result);

  const builder: {
    from: jest.Mock;
    orderBy: jest.Mock;
    limit: jest.Mock;
    offset: jest.Mock;
    where: jest.Mock;
    then: Promise<unknown>["then"];
    catch: Promise<unknown>["catch"];
    finally: Promise<unknown>["finally"];
  } = {
    from: jest.fn(() => builder),
    orderBy: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    offset: jest.fn(() => builder),
    where: jest.fn(() => resultPromise),
    then: resultPromise.then.bind(resultPromise),
    catch: resultPromise.catch.bind(resultPromise),
    finally: resultPromise.finally.bind(resultPromise),
  };

  return builder;
}

describe("usePaginatedExerciseLibrary", () => {
  beforeEach(() => {
    mockDb.select.mockReset();
  });

  it("loads initial items", async () => {
    const baseRows: ExerciseRow[] = [
      { id: "ex-1", name: "Bench Press", muscleGroup: "Chest", isCustom: true },
      { id: "ex-2", name: "Row", muscleGroup: "Back", isCustom: false },
    ];

    mockDb.select.mockImplementation((selection: Record<string, unknown>) => {
      if ("entityId" in selection) {
        return createQueryBuilder([]);
      }

      return createQueryBuilder(baseRows);
    });

    const { result, unmount } = renderHook(() =>
      usePaginatedExerciseLibrary({
        query: "",
        locale: "pt-BR",
        excludeIds: [],
      }),
    );

    await waitFor(() => {
      expect(result.current.loadingInitial).toBe(false);
      expect(result.current.items).toHaveLength(2);
      expect(result.current.items[0]?.name).toBe("Bench Press");
      expect(result.current.items[0]?.isCustom).toBe(true);
      expect(result.current.hasMore).toBe(false);
    });

    unmount();
  });
});
