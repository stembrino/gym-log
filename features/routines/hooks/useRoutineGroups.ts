import type { AppLocale } from "@/constants/translations";
import { db } from "@/db/client";
import { entityTranslations, routineGroups as routineGroupsTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";

type RoutineGroupRoutineExercise = {
  id: string;
  exerciseId: string;
  name: string;
  exerciseOrder: number;
  setsTarget: number | null;
  repsTarget: string | null;
};

export type RoutineGroupRoutine = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
  exercises: RoutineGroupRoutineExercise[];
};

export type RoutineGroup = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
  routines: RoutineGroupRoutine[];
};

type UseRoutineGroupsResult = {
  routineGroups: RoutineGroup[];
  ungroupedRoutines: RoutineGroupRoutine[];
  loading: boolean;
  toggleGroupFavorite: (groupId: string) => Promise<void>;
  reload: () => Promise<void>;
};

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

export function useRoutineGroups(locale: AppLocale): UseRoutineGroupsResult {
  const [routineGroups, setRoutineGroups] = useState<RoutineGroup[]>([]);
  const [ungroupedRoutines, setUngroupedRoutines] = useState<RoutineGroupRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutineGroups = useCallback(async () => {
    try {
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

      const groupIds = groupRows.map((group) => group.id);
      const linkedRoutineIdsSet = new Set(
        groupRows.flatMap((group) =>
          group.routineGroupRoutines
            .map((entry) => entry.routine?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const ungroupedRoutineRows = allRoutineRows.filter(
        (routine) => !linkedRoutineIdsSet.has(routine.id),
      );

      const routineIds = groupRows.flatMap((group) =>
        group.routineGroupRoutines
          .map((entry) => entry.routine?.id)
          .filter((id): id is string => Boolean(id)),
      );
      const allRoutineIds = [...routineIds, ...ungroupedRoutineRows.map((routine) => routine.id)];

      const uniqueGroupIds = Array.from(new Set(groupIds));
      const uniqueRoutineIds = Array.from(new Set(allRoutineIds));
      const exerciseIds = groupRows.flatMap((group) =>
        group.routineGroupRoutines.flatMap(
          (entry) =>
            entry.routine?.routineExercises
              .map((routineExercise) => routineExercise.exerciseId)
              .filter((id): id is string => Boolean(id)) ?? [],
        ),
      );
      const ungroupedExerciseIds = ungroupedRoutineRows.flatMap((routine) =>
        routine.routineExercises
          .map((routineExercise) => routineExercise.exerciseId)
          .filter((id): id is string => Boolean(id)),
      );
      const uniqueExerciseIds = Array.from(new Set([...exerciseIds, ...ungroupedExerciseIds]));

      const translationRows =
        uniqueGroupIds.length === 0 &&
        uniqueRoutineIds.length === 0 &&
        uniqueExerciseIds.length === 0
          ? []
          : await db
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

      const translationMap: TranslationMap = new Map(
        translationRows.map((row) => [
          buildTranslationKey(
            row.entityType as "routine" | "routine_group" | "exercise",
            row.entityId,
            row.field as "name" | "detail" | "description",
          ),
          row.value,
        ]),
      );

      const mapRoutine = (routineRow: {
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
      }): RoutineGroupRoutine => {
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
          name:
            pickTranslated(translationMap, "routine", routineRow.id, "name", routineRow.name) ?? "",
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
      };

      const hydrated = groupRows.map<RoutineGroup>((group) => ({
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
        routines: group.routineGroupRoutines.reduce<RoutineGroupRoutine[]>((acc, entry) => {
          if (!entry.routine) {
            return acc;
          }

          acc.push(mapRoutine(entry.routine));

          return acc;
        }, []),
      }));

      setRoutineGroups(hydrated);
      setUngroupedRoutines(ungroupedRoutineRows.map(mapRoutine));
    } catch {
      setRoutineGroups([]);
      setUngroupedRoutines([]);
    }
  }, [locale]);

  useEffect(() => {
    let mounted = true;

    const loadInitial = async () => {
      try {
        await loadRoutineGroups();
      } catch {
        if (mounted) {
          setRoutineGroups([]);
          setUngroupedRoutines([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    return () => {
      mounted = false;
    };
  }, [loadRoutineGroups]);

  const toggleGroupFavorite = async (groupId: string) => {
    const group = routineGroups.find((item) => item.id === groupId);

    if (!group) {
      return;
    }

    const nextFavoriteValue = !group.isFavorite;

    setRoutineGroups((prev) =>
      prev.map((item) => (item.id === groupId ? { ...item, isFavorite: nextFavoriteValue } : item)),
    );

    try {
      await db
        .update(routineGroupsTable)
        .set({ isFavorite: nextFavoriteValue })
        .where(eq(routineGroupsTable.id, groupId));
    } catch {
      setRoutineGroups((prev) =>
        prev.map((item) =>
          item.id === groupId ? { ...item, isFavorite: group.isFavorite } : item,
        ),
      );
    }
  };

  return {
    routineGroups,
    ungroupedRoutines,
    loading,
    toggleGroupFavorite,
    reload: loadRoutineGroups,
  };
}
