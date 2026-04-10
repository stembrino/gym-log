import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const muscleGroups = sqliteTable("muscle_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  i18nKey: text("i18n_key").notNull().unique(),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
  /** i18n key used to look up the translated name (e.g. "benchPress").
   *  Null for user-created custom exercises — those use `name` directly. */
  i18nKey: text("i18n_key"),
  /** Localized search index (normalized) for pt-BR queries. */
  searchPt: text("search_pt"),
  /** Localized search index (normalized) for en-US queries. */
  searchEn: text("search_en"),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  duration: integer("duration"), // minutes, nullable until workout ends
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id").primaryKey(),
  workoutId: text("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  exerciseOrder: integer("exercise_order").notNull(),
});

export const sets = sqliteTable("sets", {
  id: text("id").primaryKey(),
  workoutExerciseId: text("workout_exercise_id")
    .notNull()
    .references(() => workoutExercises.id, { onDelete: "cascade" }),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(), // kg
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  timestamp: text("timestamp").notNull(),
});
