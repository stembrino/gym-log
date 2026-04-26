# Logbook Routine Filter Plan

## Overview

Add a **routine filter** to the logbook tab, allowing users to filter completed workouts by the associated routine (similar to the existing gym filter).

## Status

⏸️ **DEFERRED** — Recommended to implement after accumulating ~20-30 workouts per routine to validate demand.

---

## Feasibility Assessment

**Complexity**: Moderate (1-hour effort)  
**Architecture Impact**: Low — follows existing gym filter pattern  
**Technical Debt**: None — builds naturally on routine association feature just completed

---

## Implementation Scope

### 1. Hook: `usePaginatedLogbook.ts`

- Add `selectedRoutineFilter` state
- Create `mapFilterToRoutineId()` function (mirrors `mapFilterToGymId()`)
- Update `fetchPage()` to pass both `gymId` + `routineId` to queries
- New return field: `routineGroups` (parallel to `gymGroups`)

### 2. Queries: `logbookQueries.ts`

- Expand `buildCompletedWorkoutFilter()` to accept optional `routineId`
- Create `getLogbookRoutineGroups()` function
  - Returns: `{ routineId: string | null, routineName: string | null, workoutsCount: number }[]`
  - Similar structure to `getLogbookGymGroups()`
- Update `getLogbookWorkoutsPage()` signature to include `routineId?: string | null`
- Update `getLogbookWorkoutsCount()` to filter by routine

### 3. Component: `LogbookTabScreen.tsx`

- Render second chip bar for routine filters (below or alongside gym filter)
- Build `routineFilterOptions` from `routineGroups`
- Display routine count on each option: `Routine Name (15)`
- Handle combined gym + routine filtering

---

## Key Design Decisions

### Filter Interaction

- **AND logic**: Gym filter × Routine filter (both apply simultaneously)
- **Edge case**: Workouts with no routine (`routineId = null`) shown under "Sem Rotina" option
- **Default**: Show all workouts, all routines (filter starts as "all")

### UX Considerations

- Place routine filter chips **below** gym filter for hierarchy
- Include "Sem Rotina" option for free workouts (not associated with any routine)
- Count updates dynamically as gym filter changes (reflect combined dataset)
- If gym is filtered + user wants routine visibility, counts reflect that subset

---

## Implementation Phases

### Phase 1: Backend (Queries + Hook)

```
logbookQueries.ts:
  ✓ buildCompletedWorkoutFilter(gymId?, routineId?)
  ✓ getLogbookRoutineGroups()
  ✓ getLogbookWorkoutsPage(..., routineId?)
  ✓ getLogbookWorkoutsCount(..., routineId?)

usePaginatedLogbook.ts:
  ✓ Add selectedRoutineFilter state
  ✓ Add routineGroups state
  ✓ Update fetchPage() to fetch routine groups on reset
  ✓ Pass routineId to all queries
```

### Phase 2: Component (UI)

```
LogbookTabScreen.tsx:
  ✓ Build routineFilterOptions memoized
  ✓ Render routine filter chips (below gym filter)
  ✓ Wire setSelectedRoutineFilter callback
  ✓ Test combined gym + routine filtering
```

---

## Testing Considerations

- **Gym-only filtering**: Still works as before ✓
- **Routine-only filtering**: All gyms, specific routine
- **Combined filtering**: Gym A + Routine B workouts only
- **Edge cases**:
  - Workouts with `sourceRoutineId = null` (free training)
  - Switching between filters (state consistency)
  - Pagination with both filters active
  - Filter counts match displayed items

---

## When to Implement

### 🟢 Implement NOW if:

- Already have 20+ workouts per routine in logbook
- Users asking for "show only Routine X workouts"
- Want complete feature set before public launch

### 🟡 Implement LATER if:

- Most workouts are still free training (not routine-based)
- Want MVP validation first
- Iterating based on real usage patterns

---

## Related Items

- ✅ [Logbook Routine Association](./logbook-share-export-plan.md) — Completed
- ✅ Routine Update from Workout — Completed
- ✅ Routine Create from Workout — Completed
- ⏳ **This Plan** — Routine Filter (deferred)

---

## Effort Estimate

- **Backend**: 20-25 minutes (queries + hook updates)
- **Frontend**: 15-20 minutes (component integration + testing)
- **Total**: ~45 minutes to 1 hour

---

## Notes

This feature has **zero blocking dependencies** and follows an established pattern in the codebase. It's low-risk to implement whenever needed.
