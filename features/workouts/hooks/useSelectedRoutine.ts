import type { AppLocale } from "@/components/providers/i18n-provider";
import { getRoutineById, type RoutineItem } from "@/features/routines/dao/queries/routineQueries";
import { useCallback, useEffect, useState } from "react";

type UseSelectedRoutineResult = {
  routine: RoutineItem | null;
  loading: boolean;
  reload: () => Promise<void>;
};

export function useSelectedRoutine(
  routineId: string | null,
  locale: AppLocale,
): UseSelectedRoutineResult {
  const [routine, setRoutine] = useState<RoutineItem | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!routineId) {
      setRoutine(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const row = await getRoutineById(routineId, locale);
      setRoutine(row);
    } catch {
      setRoutine(null);
    } finally {
      setLoading(false);
    }
  }, [locale, routineId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    routine,
    loading,
    reload,
  };
}
