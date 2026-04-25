import { useEffect, useRef } from "react";
import { getDefaultGymId } from "@/features/workouts/dao/queries/gymQueries";

type UseApplyDefaultGymFilterArgs = {
  setSelectedGymFilter: (value: string) => void;
};

export function useApplyDefaultGymFilter({
  setSelectedGymFilter,
}: UseApplyDefaultGymFilterArgs): void {
  const hasAppliedDefaultFilterRef = useRef(false);

  useEffect(() => {
    if (hasAppliedDefaultFilterRef.current) {
      return;
    }

    hasAppliedDefaultFilterRef.current = true;

    void (async () => {
      const defaultGymId = await getDefaultGymId();

      if (defaultGymId) {
        setSelectedGymFilter(defaultGymId);
      }
    })();
  }, [setSelectedGymFilter]);
}
