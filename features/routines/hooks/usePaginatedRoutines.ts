import type { AppLocale } from "@/constants/translations";
import {
  getRoutinesCount,
  getRoutinesPage,
  type RoutineItem,
} from "@/features/routines/dao/queries/routineQueries";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 20;

type UsePaginatedRoutinesOptions = {
  enabled?: boolean;
};

type UsePaginatedRoutinesResult = {
  items: RoutineItem[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  reload: () => Promise<void>;
};

export function usePaginatedRoutines(
  locale: AppLocale,
  options?: UsePaginatedRoutinesOptions,
): UsePaginatedRoutinesResult {
  const enabled = options?.enabled ?? true;
  const [items, setItems] = useState<RoutineItem[]>([]);
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
      if (!enabled) {
        return;
      }

      const requestVersion = ++requestVersionRef.current;

      if (reset) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const [rows, totalCount] = await Promise.all([
          getRoutinesPage({ page: nextPage, query: normalizedQuery, locale }),
          reset ? getRoutinesCount({ query: normalizedQuery, locale }) : Promise.resolve(null),
        ]);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setHasMore(rows.length === PAGE_SIZE);
        setPage(nextPage);
        setItems((prev) => (reset ? rows : [...prev, ...rows]));

        if (totalCount !== null && reset) {
          setHasMore(totalCount > PAGE_SIZE);
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
    [enabled, locale, normalizedQuery],
  );

  const reload = useCallback(async () => {
    if (!enabled) {
      setPage(0);
      setHasMore(false);
      setItems([]);
      setLoadingInitial(false);
      setLoadingMore(false);
      return;
    }

    setPage(0);
    setHasMore(true);
    setItems([]);
    await fetchPage(0, true);
  }, [enabled, fetchPage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const loadMore = useCallback(() => {
    if (!enabled || loadingInitial || loadingMore || !hasMore) {
      return;
    }

    void fetchPage(page + 1, false);
  }, [enabled, fetchPage, hasMore, loadingInitial, loadingMore, page]);

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
