# Workouts Schema Architecture

## Overview

The workouts feature is built on a 4-table relational model that tracks gyms, training sessions, exercises performed, and individual sets.

## Table Structure

### 1. **gyms** — Gym Registry

Stores the gyms the user trains at. One can be marked as default so it auto-fills when starting a new workout.

```typescript
gyms {
  id: text (PK)
  name: text (e.g., "Academia X")
  isDefault: boolean (default: false) ← auto-fills in new workouts
  createdAt: text
}
```

**Purpose:**

- Central registry of all gyms the user trains at
- `isDefault = true` on one gym → pre-selects it when logging a new workout
- Avoids typos and inconsistency (free-text `gymName` would diverge over time)
- Enables gym-based analytics cleanly

**Rule:** Only one gym can have `isDefault = true` at a time (enforced in app logic).

---

### 2. **workouts** — Training Session

Represents a complete training day/session.

```typescript
workouts {
  id: text (PK)
  date: text
  duration: integer (minutes, nullable until workout ends)
  notes: text (optional)
  gymId: text (FK → gyms.id, nullable) ← **KEY FIELD**
  createdAt: text
}
```

**Purpose:** Groups all exercises performed in a single training session. References the gym via `gymId` (pre-filled from default gym if set).

---

### 3. **workoutExercises** — Exercises in Session

Bridge table that links exercises to a workout, maintaining order.

```typescript
workoutExercises {
  id: text (PK)
  workoutId: text (FK → workouts.id)
  exerciseId: text (FK → exercises.id)
  exerciseOrder: integer (display order in workout)
}
```

**Purpose:**

- Defines which exercises were performed in each session
- Maintains sequence/order
- Inherits gym context from parent `workouts.gymId`

---

### 4. **sets** — Individual Series

Represents each individual set/series of an exercise.

```typescript
sets {
  id: text (PK)
  workoutExerciseId: text (FK → workoutExercises.id)
  reps: integer
  weight: real (kg)
  completed: boolean (default: false)
  timestamp: text
}
```

**Purpose:**

- Records each series with weight/reps/completion
- Rolls up to `workoutExercises` for exercise-level metrics
- Rolls up to `workouts` for session-level metrics

---

## Data Flow Example

```
Gym: "Academia X" (isDefault: true)
│
Workout: "Segunda 10/04/2026" @ Academia X  ← gymId aqui
├─ WorkoutExercise 1: Leg Press
│  ├─ Set: 100kg × 10 reps ✓
│  ├─ Set: 100kg × 8 reps ✓
│  └─ Set: 100kg × 6 reps ✓
├─ WorkoutExercise 2: Leg Curl
│  ├─ Set: 50kg × 12 reps ✓
│  └─ Set: 50kg × 10 reps ✓
└─ WorkoutExercise 3: Squat
   ├─ Set: 120kg × 6 reps ✓
   └─ Set: 120kg × 5 reps ✓
```

## Relationships Diagram

```
gyms (1)
  ↓ M
workouts (1)
  ↓ M
workoutExercises (1)
  ↓ M
sets
```

- **1 Gym** → **M Workouts** (user trains at the same gym many times)
- **1 Workout** → **M WorkoutExercises** (many exercises per workout)
- **1 WorkoutExercise** → **M Sets** (many sets per exercise)
- **1 Set** → **1 WorkoutExercise** (each set belongs to exactly one exercise instance)

## Key Design Decisions

### ✅ Why a dedicated `gyms` table with `isDefault`:

1. User trains at multiple gyms — a table allows managing all of them
2. `isDefault = true` auto-fills `gymId` in new workouts, no repetition needed
3. No typo risk (vs free-text `gymName` that could be "Academia X", "academia x", "Ac. X")
4. Easy to rename a gym in one place — all workouts update automatically via FK
5. Enables gym-based analytics (frequency, PRs per gym, etc.)

### ✅ Why `gymId` in `workouts` and not `workoutExercises` or `sets`:

1. A workout happens at one gym — `workouts` is the natural owner
2. No redundancy (one FK, not repeated for every exercise or every set)
3. `workoutExercises` and `sets` inherit the gym through the relationship chain
4. A user can do two workouts/day — each workout has its own `gymId`

### ✅ Why 3 tables and not 2:

1. **workoutExercises** provides exercise ordering and identity within the workout
2. Enables "PRs per gym" queries (best leg press at Academia X vs Y)
3. Separates concerns: session (workout) vs exercise (workoutExercise) vs measurement (set)

## Future Queries Enabled

- "What was my best leg press ever?" → aggregate `sets.weight` where `exercises.id = 'leg-press'`
- "What was my best leg press at Academia X?" → join `sets` → `workoutExercises` → `workouts` → `gyms` where `gyms.name = 'Academia X'`
- "Did I improve leg press from week 1 to week 2?" → compare two date ranges
- "Which gym do I train at most?" → count workouts grouped by `gymId`
- "Which gym do I lift heaviest at?" → group by `gymId` and aggregate max weight

---

## Migration & Compatibility

When adding `gyms` table and `gymId` to `workouts`:

- `gyms` is a new table — safe to add via `CREATE TABLE IF NOT EXISTS`
- `workouts.gymId` is nullable — existing rows default to `NULL` (no gym set)
- User sets up their gym(s) once; `isDefault` takes care of the rest
- App logic enforces only one `isDefault = true` at a time (update others to false before setting new default)
