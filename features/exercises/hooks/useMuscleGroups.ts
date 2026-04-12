import { useEffect, useState } from "react";
import { getMuscleGroupNames } from "../dao/queries/exerciseQueries";

export function useMuscleGroups() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) {
        return;
      }

      const names = await getMuscleGroupNames();

      if (!mounted) {
        return;
      }

      setItems(names);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return { items };
}
