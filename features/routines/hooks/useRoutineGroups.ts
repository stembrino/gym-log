import type { AppLocale } from "@/constants/translations";
import { db } from "@/db/client";
import { routineGroups as routineGroupsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import {
  getRoutineGroups as daoGetRoutineGroups,
  getUngroupedRoutines as daoGetUngroupedRoutines,
} from "../dao/queries/routineQueries";
import type { RoutineExercise, RoutineItem } from "../dao/queries/routineQueries";

export type RoutineGroupRoutineExercise = RoutineExercise;

export type RoutineGroupRoutine = RoutineItem;

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

export function useRoutineGroups(locale: AppLocale): UseRoutineGroupsResult {
  const [routineGroups, setRoutineGroups] = useState<RoutineGroup[]>([]);
  const [ungroupedRoutines, setUngroupedRoutines] = useState<RoutineGroupRoutine[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoutineGroups = useCallback(async () => {
    try {
      const groups = await daoGetRoutineGroups(locale);
      const ungrouped = await daoGetUngroupedRoutines(locale);

      setRoutineGroups(groups);
      setUngroupedRoutines(ungrouped);
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
