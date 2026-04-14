/**
 * Dev-only mock routine data.
 * Never import this file from production code.
 */

export const DEV_MOCK_ROUTINES = [
  {
    id: "routine-debug-01",
    name: "Debug Routine",
    detail: "Debug",
    description: "Default debug routine for development.",
    isSystem: true,
    labelPt: "Rotina Debug",
    labelEn: "Debug Routine",
    createdAt: "2026-04-10T00:00:00.000Z",
  },
  {
    id: "routine-debug-02",
    name: "Debug Routine 2",
    detail: "Debug",
    description: "Second default debug routine for development.",
    isSystem: true,
    labelPt: "Rotina Debug 2",
    labelEn: "Debug Routine 2",
    createdAt: "2026-04-10T00:01:00.000Z",
  },
] as const;

export const DEV_MOCK_ROUTINE_TAG_LINKS = [
  { routineId: "routine-debug-01", tagId: "rt-01" },
  { routineId: "routine-debug-01", tagId: "rt-10" },
  { routineId: "routine-debug-02", tagId: "rt-02" },
  { routineId: "routine-debug-02", tagId: "rt-08" },
] as const;

export const DEV_MOCK_ROUTINE_EXERCISES = [
  {
    id: "rte-debug-01",
    routineId: "routine-debug-01",
    exerciseId: "ex-04-back", // Lat Pulldown
    exerciseOrder: 1,
    setsTarget: 3,
    repsTarget: "10-12",
  },
  {
    id: "rte-debug-02",
    routineId: "routine-debug-01",
    exerciseId: "ex-05-back", // Seated Cable Row
    exerciseOrder: 2,
    setsTarget: 3,
    repsTarget: "10-12",
  },
  {
    id: "rte-debug-03",
    routineId: "routine-debug-02",
    exerciseId: "ex-01-chest", // Bench Press
    exerciseOrder: 1,
    setsTarget: 3,
    repsTarget: "8-10",
  },
  {
    id: "rte-debug-04",
    routineId: "routine-debug-02",
    exerciseId: "ex-01-shoulders", // Overhead Press
    exerciseOrder: 2,
    setsTarget: 3,
    repsTarget: "8-10",
  },
] as const;

export const DEV_MOCK_ROUTINE_GROUPS = [
  {
    id: "rg-debug-01",
    name: "Debug Group",
    detail: "Debug",
    description: "Default debug routine group for development.",
    isSystem: true,
    labelPt: "Grupo Debug",
    labelEn: "Debug Group",
    createdAt: "2026-04-10T00:10:00.000Z",
  },
  {
    id: "rg-debug-02",
    name: "Debug Group 2",
    detail: "Debug",
    description: "Second default debug routine group for development.",
    isSystem: true,
    labelPt: "Grupo Debug 2",
    labelEn: "Debug Group 2",
    createdAt: "2026-04-10T00:11:00.000Z",
  },
] as const;

export const DEV_MOCK_ROUTINE_GROUP_ROUTINES = [
  {
    routineGroupId: "rg-debug-01",
    routineId: "routine-debug-01",
    position: 1,
    label: "Debug",
  },
  {
    routineGroupId: "rg-debug-02",
    routineId: "routine-debug-02",
    position: 1,
    label: "Debug 2",
  },
] as const;

export const DEV_MOCK_ROUTINE_IDS = ["routine-debug-01", "routine-debug-02"] as const;

export const DEV_MOCK_ROUTINE_GROUP_IDS = ["rg-debug-01", "rg-debug-02"] as const;
