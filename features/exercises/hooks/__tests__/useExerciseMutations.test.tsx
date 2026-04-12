import { renderHook } from "@testing-library/react-native";
import { useExerciseMutations } from "@/features/exercises/hooks/useExerciseMutations";

jest.mock("@/features/exercises/dao/mutations/exerciseMutations", () => ({
  createCustomExercise: jest.fn(),
  deleteCustomExercise: jest.fn(),
}));

const mockCreateCustomExercise = jest.requireMock(
  "@/features/exercises/dao/mutations/exerciseMutations",
).createCustomExercise as jest.Mock;
const mockDeleteCustomExercise = jest.requireMock(
  "@/features/exercises/dao/mutations/exerciseMutations",
).deleteCustomExercise as jest.Mock;

describe("useExerciseMutations", () => {
  beforeEach(() => {
    mockCreateCustomExercise.mockReset();
    mockDeleteCustomExercise.mockReset();
    jest.restoreAllMocks();
  });

  it("creates a custom exercise and reloads", async () => {
    const reload = jest.fn(async () => {});
    mockCreateCustomExercise.mockResolvedValue(undefined);

    const { result } = renderHook(() => useExerciseMutations(reload));

    await result.current.createExercise({
      name: "  Bench Press  ",
      muscleGroup: "  Chest  ",
    });

    expect(mockCreateCustomExercise).toHaveBeenCalledWith({
      name: "  Bench Press  ",
      muscleGroup: "  Chest  ",
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("throws duplicate error and does not insert", async () => {
    const reload = jest.fn(async () => {});
    mockCreateCustomExercise.mockRejectedValue(new Error("duplicate_exercise"));

    const { result } = renderHook(() => useExerciseMutations(reload));

    await expect(
      result.current.createExercise({
        name: "Bench Press",
        muscleGroup: "Chest",
      }),
    ).rejects.toThrow("duplicate_exercise");

    expect(mockCreateCustomExercise).toHaveBeenCalledTimes(1);
    expect(reload).not.toHaveBeenCalled();
  });

  it("deletes custom exercise and reloads", async () => {
    const reload = jest.fn(async () => {});
    mockDeleteCustomExercise.mockResolvedValue(undefined);

    const { result } = renderHook(() => useExerciseMutations(reload));

    await result.current.deleteExercise("ex-custom-1");

    expect(mockDeleteCustomExercise).toHaveBeenCalledWith("ex-custom-1");
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
