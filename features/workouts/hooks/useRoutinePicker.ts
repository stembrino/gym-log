import type { AppLocale } from "@/components/providers/i18n-provider";
import {
  getRoutinesCount,
  getRoutinesPage,
  type RoutineItem,
} from "@/features/routines/dao/queries/routineQueries";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 20;

export type WorkoutRoutinePickerItem = {
  id: string;
  name: string;
  detail: string | null;
  description: string | null;
  createdAt: string;
  exercises: RoutineItem["exercises"];
};

type UseRoutinePickerResult = {
  items: WorkoutRoutinePickerItem[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  reload: () => Promise<void>;
};

export function useRoutinePicker(locale: AppLocale): UseRoutinePickerResult {
  const [items, setItems] = useState<WorkoutRoutinePickerItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const normalizedQuery = useMemo(() => debouncedQuery.trim().toLowerCase(), [debouncedQuery]);

  const fetchPage = useCallback(
    async (nextPage: number, reset: boolean) => {
      const requestVersion = ++requestVersionRef.current;

      if (reset) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const [rows, nextTotal] = await Promise.all([
          getRoutinesPage({ page: nextPage, query: normalizedQuery, locale }),
          reset ? getRoutinesCount({ query: normalizedQuery, locale }) : Promise.resolve(null),
        ]);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        const mapped = rows.map<WorkoutRoutinePickerItem>((routine) => ({
          id: routine.id,
          name: routine.name,
          detail: routine.detail,
          description: routine.description,
          createdAt: routine.createdAt,
          exercises: routine.exercises,
        }));

        setHasMore(rows.length === PAGE_SIZE);
        setPage(nextPage);
        setItems((prev) => (reset ? mapped : [...prev, ...mapped]));

        if (nextTotal !== null && reset) {
          setHasMore(nextTotal > PAGE_SIZE);
        }
      } catch {
        if (requestVersion === requestVersionRef.current) {
          setHasMore(false);
          if (reset) {
            setItems([]);
          }
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [locale, normalizedQuery],
  );

  const reload = useCallback(async () => {
    setPage(0);
    setHasMore(true);
    setItems([]);
    await fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMore) {
      return;
    }

    void fetchPage(page + 1, false);
  }, [fetchPage, hasMore, loadingInitial, loadingMore, page]);

  return {
    items,
    searchQuery,
    setSearchQuery,
    hasMore,
    loadingInitial,
    loadingMore,
    loadMore,
    reload,
  };
}
