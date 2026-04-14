import { FEATURE_FLAGS } from "@/constants/featureFlags";
import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  routineExercises,
  routineGroupRoutines,
  routineGroups,
  routines,
  routineTagLinks,
} from "@/db/schema";
import {
  DEV_MOCK_ROUTINE_EXERCISES,
  DEV_MOCK_ROUTINE_GROUP_IDS,
  DEV_MOCK_ROUTINE_GROUP_ROUTINES,
  DEV_MOCK_ROUTINE_GROUPS,
  DEV_MOCK_ROUTINE_IDS,
  DEV_MOCK_ROUTINE_TAG_LINKS,
  DEV_MOCK_ROUTINES,
} from "./mockRoutines.devOnly";

export async function runDevOnlyInjectMockRoutines(database = db): Promise<void> {
  if (!__DEV__ || !FEATURE_FLAGS.devInjectMockRoutinesOnStart) {
    return;
  }

  console.log("[devOnly] runDevOnlyInjectMockRoutines: starting...");

  // --- clean ---
  await database
    .delete(routineGroupRoutines)
    .where(inArray(routineGroupRoutines.routineGroupId, [...DEV_MOCK_ROUTINE_GROUP_IDS]));

  await database
    .delete(routineGroups)
    .where(inArray(routineGroups.id, [...DEV_MOCK_ROUTINE_GROUP_IDS]));

  await database
    .delete(routineTagLinks)
    .where(inArray(routineTagLinks.routineId, [...DEV_MOCK_ROUTINE_IDS]));

  await database
    .delete(routineExercises)
    .where(inArray(routineExercises.routineId, [...DEV_MOCK_ROUTINE_IDS]));

  await database.delete(routines).where(inArray(routines.id, [...DEV_MOCK_ROUTINE_IDS]));

  // --- inject ---
  await database.insert(routines).values(
    DEV_MOCK_ROUTINES.map((r) => ({
      id: r.id,
      name: r.name,
      detail: r.detail,
      description: r.description,
      isSystem: r.isSystem,
      createdAt: r.createdAt,
      ...buildRoutineSearchIndex(r),
    })),
  );

  await database.insert(routineGroups).values(
    DEV_MOCK_ROUTINE_GROUPS.map((g) => ({
      id: g.id,
      name: g.name,
      detail: g.detail,
      description: g.description,
      isSystem: g.isSystem,
      createdAt: g.createdAt,
      ...buildRoutineGroupSearchIndex(g),
    })),
  );

  await database.insert(routineTagLinks).values(DEV_MOCK_ROUTINE_TAG_LINKS.map((l) => ({ ...l })));

  await database.insert(routineExercises).values(DEV_MOCK_ROUTINE_EXERCISES.map((e) => ({ ...e })));

  await database
    .insert(routineGroupRoutines)
    .values(DEV_MOCK_ROUTINE_GROUP_ROUTINES.map((r) => ({ ...r })));

  console.log(
    `[devOnly] runDevOnlyInjectMockRoutines: done — ${DEV_MOCK_ROUTINES.length} routines, ${DEV_MOCK_ROUTINE_GROUPS.length} groups inserted`,
  );
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildRoutineSearchIndex(routine: { name: string; labelPt: string; labelEn: string }) {
  return {
    searchPt: normalizeSearchText(`${routine.labelPt} ${routine.name}`),
    searchEn: normalizeSearchText(`${routine.labelEn} ${routine.name}`),
  };
}

function buildRoutineGroupSearchIndex(group: { name: string; labelPt: string; labelEn: string }) {
  return {
    searchPt: normalizeSearchText(`${group.labelPt} ${group.name}`),
    searchEn: normalizeSearchText(`${group.labelEn} ${group.name}`),
  };
}
