import { DEFAULT_ROUTINE_TAGS } from "@/db/patches/data/routineTags";
import { routineTags } from "@/db/schema";
import type { db } from "@/db/client";
import { inArray, not, sql } from "drizzle-orm";

type PatchDb = typeof db;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildRoutineTagSearchIndex(tag: { slug: string; labelPt: string; labelEn: string }) {
  return {
    searchPt: normalizeSearchText(`${tag.labelPt} ${tag.slug}`),
    searchEn: normalizeSearchText(`${tag.labelEn} ${tag.slug}`),
  };
}

export async function runV4ReseedRoutineTagsPatch(database: PatchDb): Promise<void> {
  const allowedTagIds = DEFAULT_ROUTINE_TAGS.map((tag) => tag.id);

  await database.delete(routineTags).where(not(inArray(routineTags.id, allowedTagIds)));

  await database
    .insert(routineTags)
    .values(
      DEFAULT_ROUTINE_TAGS.map((tag) => ({
        id: tag.id,
        slug: tag.slug,
        labelPt: tag.labelPt,
        labelEn: tag.labelEn,
        ...buildRoutineTagSearchIndex(tag),
      })),
    )
    .onConflictDoUpdate({
      target: routineTags.id,
      set: {
        slug: sql`excluded.slug`,
        labelPt: sql`excluded.label_pt`,
        labelEn: sql`excluded.label_en`,
        searchPt: sql`excluded.search_pt`,
        searchEn: sql`excluded.search_en`,
      },
    });
}
