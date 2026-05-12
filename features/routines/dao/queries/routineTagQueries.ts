import { db } from "@/db/client";
import { routineTags } from "@/db/schema";

export async function getAllRoutineTags() {
  return db.select().from(routineTags).all();
}
