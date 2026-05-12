import { db } from "../../client";
import { routineTags } from "../../schema";

export async function seedRoutineTags() {
  await db.insert(routineTags).values([
    { id: "rt-02", slug: "superior", labelPt: "superior", labelEn: "upper" },
    { id: "rt-03", slug: "puxar", labelPt: "puxar", labelEn: "pull" },
    { id: "rt-04", slug: "empurrar", labelPt: "empurrar", labelEn: "push" },
    { id: "rt-05", slug: "pernas", labelPt: "pernas", labelEn: "legs" },
    { id: "rt-06", slug: "core", labelPt: "core", labelEn: "core" },
    { id: "rt-07", slug: "forca", labelPt: "força", labelEn: "strength" },
    { id: "rt-08", slug: "full-body", labelPt: "corpo inteiro", labelEn: "full body" },
  ]);
  console.log("Seeded routine tags");
}

if (require.main === module) {
  seedRoutineTags().then(() => process.exit(0));
}
