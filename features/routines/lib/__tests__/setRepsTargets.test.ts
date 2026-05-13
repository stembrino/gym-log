import { parseRoutineSetRepsTargets, serializeRoutineSetRepsTargets } from "../setRepsTargets";

describe("parseRoutineSetRepsTargets", () => {
  it("parses JSON array reps targets", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 2, repsTarget: "[9,12]" })).toEqual([
      "9",
      "12",
    ]);
  });

  it("parses slash-delimited reps targets", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 2, repsTarget: "9/12" })).toEqual(["9", "12"]);
  });

  it("parses semicolon-delimited reps targets", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 2, repsTarget: "9;12" })).toEqual(["9", "12"]);
  });

  it("parses whitespace-delimited reps targets when count matches sets", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 2, repsTarget: "9 12" })).toEqual(["9", "12"]);
  });

  it("keeps legacy single value replicated by set count", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 2, repsTarget: "9" })).toEqual(["9", "9"]);
  });

  it("uses first numeric token for legacy range-like values", () => {
    expect(parseRoutineSetRepsTargets({ setsTarget: 3, repsTarget: "8-10" })).toEqual([
      "8",
      "8",
      "8",
    ]);
  });
});

describe("serializeRoutineSetRepsTargets", () => {
  it("serializes numeric per-set reps as JSON", () => {
    expect(serializeRoutineSetRepsTargets([9, 12])).toEqual({
      setsTarget: 2,
      repsTarget: "[9,12]",
    });
  });
});
