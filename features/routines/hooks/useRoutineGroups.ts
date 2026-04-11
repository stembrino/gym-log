import { db } from "@/db/client";
import { entityTranslations, routineGroups as routineGroupsTable } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import type { AppLocale } from "@/constants/translations";

type RoutineGroupRoutineExercise = {
  id: string;
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

      const groupIds = groupRows.map((group) => group.id);
      const routineIds = groupRows.flatMap((group) =>
        group.routineGroupRoutines
          .map((entry) => entry.routine?.id)
          .filter((id): id is string => Boolean(id)),
      );

      const uniqueGroupIds = Array.from(new Set(groupIds));
      const uniqueRoutineIds = Array.from(new Set(routineIds));
      const exerciseIds = groupRows.flatMap((group) =>
        group.routineGroupRoutines.flatMap(
          (entry) =>
            entry.routine?.routineExercises
              .map((routineExercise) => routineExercise.exerciseId)
              .filter((id): id is string => Boolean(id)) ?? [],
        ),
      );
      const uniqueExerciseIds = Array.from(new Set(exerciseIds));

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

          const exercises = entry.routine.routineExercises.map((routineExercise) => {
            const exercise = routineExercise.exercise;

            return {
              id: routineExercise.id,
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

          acc.push({
            id: entry.routine.id,
            name:
              pickTranslated(
                translationMap,
                "routine",
                entry.routine.id,
                "name",
                entry.routine.name,
              ) ?? "",
            detail: pickTranslated(
              translationMap,
              "routine",
              entry.routine.id,
              "detail",
              entry.routine.detail ?? null,
            ),
            description: pickTranslated(
              translationMap,
              "routine",
              entry.routine.id,
              "description",
              entry.routine.description ?? null,
            ),
            isFavorite: entry.routine.isFavorite,
            createdAt: entry.routine.createdAt,
            exercises,
          });

          return acc;
        }, []),
      }));

      setRoutineGroups(hydrated);
    } catch {
      setRoutineGroups([]);
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

  return { routineGroups, loading, toggleGroupFavorite, reload: loadRoutineGroups };
}
