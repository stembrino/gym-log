import type { AppLocale } from "@/constants/translations";
import { db } from "@/db/client";
import { entityTranslations } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export type RoutineExercise = {
  id: string;
  exerciseId: string;
  name: string;
  exerciseOrder: number;
  setsTarget: number | null;
  repsTarget: string | null;
};

export type RoutineItem = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
  exercises: RoutineExercise[];
};

export type RoutineGroupItem = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
  routines: RoutineItem[];
};

// Translation helpers
function buildTranslationKey(
  entityType: "routine" | "routine_group" | "exercise",
  entityId: string,
  field: "name" | "detail" | "description",
): string {
  return `${entityType}:${entityId}:${field}`;
}

type TranslationMap = Map<string, string>;

function pickTranslated(
  map: TranslationMap,
  entityType: "routine" | "routine_group" | "exercise",
  entityId: string,
  field: "name" | "detail" | "description",
  fallback: string | null,
): string | null {
  const translated = map.get(buildTranslationKey(entityType, entityId, field));
  if (translated !== undefined) {
    return translated;
  }
  return fallback;
}

async function loadTranslations(
  locale: AppLocale,
  groupIds: string[],
  routineIds: string[],
  exerciseIds: string[],
): Promise<TranslationMap> {
  const uniqueGroupIds = Array.from(new Set(groupIds));
  const uniqueRoutineIds = Array.from(new Set(routineIds));
  const uniqueExerciseIds = Array.from(new Set(exerciseIds));

  if (
    uniqueGroupIds.length === 0 &&
    uniqueRoutineIds.length === 0 &&
    uniqueExerciseIds.length === 0
  ) {
    return new Map();
  }

  const translationRows = await db
    .select({
      entityType: entityTranslations.entityType,
      entityId: entityTranslations.entityId,
      field: entityTranslations.field,
      value: entityTranslations.value,
    })
    .from(entityTranslations)
    .where(
      and(
        eq(entityTranslations.locale, locale),
        inArray(entityTranslations.entityType, ["routine", "routine_group", "exercise"]),
        inArray(entityTranslations.field, ["name", "detail", "description"]),
        inArray(entityTranslations.entityId, [
          ...uniqueGroupIds,
          ...uniqueRoutineIds,
          ...uniqueExerciseIds,
        ]),
      ),
    );

  return new Map(
    translationRows.map((row) => [
      buildTranslationKey(
        row.entityType as "routine" | "routine_group" | "exercise",
        row.entityId,
        row.field as "name" | "detail" | "description",
      ),
      row.value,
    ]),
  );
}

function mapRoutine(
  routineRow: {
    id: string;
    name: string;
    detail: string | null;
    description: string | null;
    isFavorite: boolean;
    createdAt: string;
    routineExercises: {
      id: string;
      exerciseId: string;
      exerciseOrder: number;
      setsTarget: number | null;
      repsTarget: string | null;
      exercise: {
        name: string;
      } | null;
    }[];
  },
  translationMap: TranslationMap,
): RoutineItem {
  const exercises = routineRow.routineExercises.map((routineExercise) => {
    const exercise = routineExercise.exercise;
    return {
      id: routineExercise.id,
      exerciseId: routineExercise.exerciseId,
      name:
        pickTranslated(
          translationMap,
          "exercise",
          routineExercise.exerciseId,
          "name",
          exercise?.name ?? routineExercise.exerciseId,
        ) ?? routineExercise.exerciseId,
      exerciseOrder: routineExercise.exerciseOrder,
      setsTarget: routineExercise.setsTarget,
      repsTarget: routineExercise.repsTarget,
    };
  });

  return {
    id: routineRow.id,
    name: pickTranslated(translationMap, "routine", routineRow.id, "name", routineRow.name) ?? "",
    detail: pickTranslated(
      translationMap,
      "routine",
      routineRow.id,
      "detail",
      routineRow.detail ?? null,
    ),
    description: pickTranslated(
      translationMap,
      "routine",
      routineRow.id,
      "description",
      routineRow.description ?? null,
    ),
    isFavorite: routineRow.isFavorite,
    createdAt: routineRow.createdAt,
    exercises,
  };
}

/**
 * Load all routine groups with their linked routines and exercises.
 */
export async function getRoutineGroups(locale: AppLocale): Promise<RoutineGroupItem[]> {
  const groupRows = await db.query.routineGroups.findMany({
    orderBy: (group, { asc }) => [asc(group.createdAt)],
    with: {
      routineGroupRoutines: {
        orderBy: (entry, { asc }) => [asc(entry.position)],
        with: {
          routine: {
            with: {
              routineExercises: {
                orderBy: (routineExercise, { asc }) => [asc(routineExercise.exerciseOrder)],
                with: {
                  exercise: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const groupIds = groupRows.map((group) => group.id);
  const routineIds = groupRows.flatMap((group) =>
    group.routineGroupRoutines
      .map((entry) => entry.routine?.id)
      .filter((id): id is string => Boolean(id)),
  );
  const exerciseIds = groupRows.flatMap((group) =>
    group.routineGroupRoutines.flatMap(
      (entry) =>
        entry.routine?.routineExercises
          .map((routineExercise) => routineExercise.exerciseId)
          .filter((id): id is string => Boolean(id)) ?? [],
    ),
  );

  const translationMap = await loadTranslations(locale, groupIds, routineIds, exerciseIds);

  return groupRows.map<RoutineGroupItem>((group) => ({
    id: group.id,
    name: pickTranslated(translationMap, "routine_group", group.id, "name", group.name) ?? "",
    detail: pickTranslated(
      translationMap,
      "routine_group",
      group.id,
      "detail",
      group.detail ?? null,
    ),
    description: pickTranslated(
      translationMap,
      "routine_group",
      group.id,
      "description",
      group.description ?? null,
    ),
    isFavorite: group.isFavorite,
    createdAt: group.createdAt,
    routines: group.routineGroupRoutines
      .map((entry) => (entry.routine ? mapRoutine(entry.routine, translationMap) : null))
      .filter((routine): routine is RoutineItem => routine !== null),
  }));
}

/**
 * Load all ungrouped routines (not in any group).
 */
export async function getUngroupedRoutines(locale: AppLocale): Promise<RoutineItem[]> {
  const groupRows = await db.query.routineGroups.findMany({
    with: {
      routineGroupRoutines: {
        with: {
          routine: true,
        },
      },
    },
  });

  const linkedRoutineIdsSet = new Set(
    groupRows.flatMap((group) =>
      group.routineGroupRoutines
        .map((entry) => entry.routine?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const allRoutineRows = await db.query.routines.findMany({
    orderBy: (routine, { asc }) => [asc(routine.createdAt)],
    with: {
      routineExercises: {
        orderBy: (routineExercise, { asc }) => [asc(routineExercise.exerciseOrder)],
        with: {
          exercise: true,
        },
      },
    },
  });

  const ungroupedRoutineRows = allRoutineRows.filter(
    (routine) => !linkedRoutineIdsSet.has(routine.id),
  );

  const routineIds = ungroupedRoutineRows.map((routine) => routine.id);
  const exerciseIds = ungroupedRoutineRows.flatMap((routine) =>
    routine.routineExercises
      .map((routineExercise) => routineExercise.exerciseId)
      .filter((id): id is string => Boolean(id)),
  );

  const translationMap = await loadTranslations(locale, [], routineIds, exerciseIds);

  return ungroupedRoutineRows.map((routine) => mapRoutine(routine, translationMap));
}

/**
 * Load all routines as a flat list (grouped + ungrouped together).
 */
export async function getRoutinesFlat(locale: AppLocale): Promise<RoutineItem[]> {
  const allRoutineRows = await db.query.routines.findMany({
    orderBy: (routine, { asc }) => [asc(routine.createdAt)],
    with: {
      routineExercises: {
        orderBy: (routineExercise, { asc }) => [asc(routineExercise.exerciseOrder)],
        with: {
          exercise: true,
        },
      },
    },
  });

  const routineIds = allRoutineRows.map((routine) => routine.id);
  const exerciseIds = allRoutineRows.flatMap((routine) =>
    routine.routineExercises
      .map((routineExercise) => routineExercise.exerciseId)
      .filter((id): id is string => Boolean(id)),
  );

  const translationMap = await loadTranslations(locale, [], routineIds, exerciseIds);

  return allRoutineRows.map((routine) => mapRoutine(routine, translationMap));
}

/**
 * Load routines for a specific group.
 */
export async function getRoutinesByGroup(
  groupId: string,
  locale: AppLocale,
): Promise<RoutineItem[]> {
  const groupRow = await db.query.routineGroups.findFirst({
    where: (group, { eq }) => eq(group.id, groupId),
    with: {
      routineGroupRoutines: {
        orderBy: (entry, { asc }) => [asc(entry.position)],
        with: {
          routine: {
            with: {
              routineExercises: {
                orderBy: (routineExercise, { asc }) => [asc(routineExercise.exerciseOrder)],
                with: {
                  exercise: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!groupRow) {
    return [];
  }

  const routineIds = groupRow.routineGroupRoutines
    .map((entry) => entry.routine?.id)
    .filter((id): id is string => Boolean(id));
  const exerciseIds = groupRow.routineGroupRoutines.flatMap(
    (entry) =>
      entry.routine?.routineExercises
        .map((routineExercise) => routineExercise.exerciseId)
        .filter((id): id is string => Boolean(id)) ?? [],
  );

  const translationMap = await loadTranslations(locale, [], routineIds, exerciseIds);

  return groupRow.routineGroupRoutines
    .map((entry) => (entry.routine ? mapRoutine(entry.routine, translationMap) : null))
    .filter((routine): routine is RoutineItem => routine !== null);
}
