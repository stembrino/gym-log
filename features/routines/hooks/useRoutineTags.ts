import { useEffect, useState } from "react";
import { getAllRoutineTags } from "../dao/queries/routineTagQueries";

export function useRoutineTags(locale?: string) {
  const [tags, setTags] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const isPt = locale?.toLowerCase().startsWith("pt") ?? true;

  useEffect(() => {
    getAllRoutineTags().then((data) => {
      setTags(
        data.map((tag) => {
          const localizedLabel = isPt ? tag.labelPt : tag.labelEn;
          return {
            id: tag.id,
            label: localizedLabel || tag.slug,
          };
        }),
      );
      setLoading(false);
    });
  }, [isPt]);

  return { tags, loading };
}
