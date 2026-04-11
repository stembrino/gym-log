/**
 * Default routine groups seeded on first launch.
 */
export const DEFAULT_ROUTINE_GROUPS = [
  {
    id: "rg-01",
    name: "Push Pull Upper",
    detail: "2-day upper split",
    description: "Simple split alternating push and pull upper sessions.",
    isSystem: true,
    labelPt: "push pull superior",
    labelEn: "push pull upper",
    createdAt: "2026-04-10T00:10:00.000Z",
  },
  {
    id: "rg-02",
    name: "Upper Machine Focus",
    detail: "Machine-based",
    description: "Upper-body machine routines for controlled progression.",
    isSystem: true,
    labelPt: "superior foco em maquinas",
    labelEn: "upper machine focus",
    createdAt: "2026-04-10T00:11:00.000Z",
  },
] as const;

export const DEFAULT_ROUTINE_GROUP_ROUTINES = [
  { routineGroupId: "rg-01", routineId: "routine-02", position: 1, label: "Push" },
  { routineGroupId: "rg-01", routineId: "routine-01", position: 2, label: "Pull" },
  { routineGroupId: "rg-02", routineId: "routine-01", position: 1, label: "Pull Upper" },
  { routineGroupId: "rg-02", routineId: "routine-02", position: 2, label: "Push Upper" },
] as const;
