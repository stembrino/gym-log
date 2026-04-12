import type { AppLocale } from "@/components/providers/i18n-provider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getExerciseLibraryCount,
  getExerciseLibraryPage,
  type ExerciseLibraryItem,
} from "../dao/queries/exerciseQueries";

export type { ExerciseLibraryItem } from "../dao/queries/exerciseQueries";

const PAGE_SIZE = 20;

type UsePaginatedExerciseLibraryParams = {
  query: string;
  locale: AppLocale;
  excludeIds: string[];
};

export function usePaginatedExerciseLibrary({
  query,
  locale,
  excludeIds,
}: UsePaginatedExerciseLibraryParams) {
  const [items, setItems] = useState<ExerciseLibraryItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const requestVersionRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const normalizedQuery = useMemo(() => debouncedQuery.trim().toLowerCase(), [debouncedQuery]);
  const excludeKey = useMemo(() => [...excludeIds].sort().join("|"), [excludeIds]);
  const stableExcludeIds = useMemo(() => (excludeKey ? excludeKey.split("|") : []), [excludeKey]);

  const fetchPage = useCallback(
    async (nextPage: number, reset: boolean) => {
      const requestVersion = ++requestVersionRef.current;

      if (reset) {
        setLoadingInitial(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const requestArgs = {
          query: normalizedQuery,
          locale,
          excludeIds: stableExcludeIds,
        };

        const [rows, nextTotalCount] = await Promise.all([
          getExerciseLibraryPage({
            page: nextPage,
            ...requestArgs,
          }),
          reset ? getExerciseLibraryCount(requestArgs) : Promise.resolve(null),
        ]);

        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        if (nextTotalCount !== null) {
          setTotalCount(nextTotalCount);
        }

        setHasMore(rows.length === PAGE_SIZE);
        setPage(nextPage);
        setItems((prev) => (reset ? rows : [...prev, ...rows]));
      } catch {
        if (requestVersion !== requestVersionRef.current) {
          return;
        }

        setHasMore(false);
        if (reset) {
          setTotalCount(0);
          setItems([]);
        }
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setLoadingInitial(false);
          setLoadingMore(false);
        }
      }
    },
    [locale, normalizedQuery, stableExcludeIds],
  );

  const reload = useCallback(async () => {
    setPage(0);
    setTotalCount(0);
    setHasMore(true);
    setItems([]);
    await fetchPage(0, true);
  }, [fetchPage]);

  useEffect(() => {
    void reload();
  }, [excludeKey, reload]);

  const loadMore = useCallback(() => {
    if (loadingInitial || loadingMore || !hasMore) {
      return;
    }

    fetchPage(page + 1, false);
  }, [fetchPage, hasMore, loadingInitial, loadingMore, page]);

  return {
    items,
    totalCount,
    hasMore,
    loadingInitial,
    loadingMore,
    loadMore,
    reload,
  };
}
