import { db } from "@/db/client";
import { exercises, gyms, routines, sets, workoutExercises, workouts } from "@/db/schema";

export async function getLocalDataSummary() {
  const [gymRows, exerciseRows, routineRows, workoutRows, workoutExerciseRows, setRows] =
    await Promise.all([
      db.select().from(gyms),
      db.select().from(exercises),
      db.select().from(routines),
      db.select().from(workouts),
      db.select().from(workoutExercises),
      db.select().from(sets),
    ]);

  return {
    gyms: gymRows.length,
    exercises: exerciseRows.length,
    routines: routineRows.length,
    workouts: workoutRows.length,
    workoutExercises: workoutExerciseRows.length,
    sets: setRows.length,
  };
}
