# Routines Beta Review

Date: 2026-04-11
Scope: routines flow (screens, hooks, modals, list behavior, tests)

## UI/UX Changes (2026-04-11)

### Terminology: "Routine Group" → "Routine Collection"

- All UI text and i18n keys updated to use "Collection" instead of "Group".
- Affects: translations.ts, CreateRoutineGroupModal, BasicInfoScreen, RoutinesTabScreen.

### Form Descriptions

- Collection creation form: shows `groupFormHint` description at the top — "Organize suas rotinas em coleções (ex: Push Pull Legs, Upper Lower)."
- Routine creation form: unchanged.

### Validation — Required Name Field

- Both routine and collection creation forms now validate the name field on submit.
- Empty name: input border turns accent color + error label "Este campo é obrigatório" / "This field is required" appears below.
- Error clears automatically when user starts typing.
- Removed `disabled` prop from Next/Submit buttons; validation runs in handler instead.
- Removed `RequiredFieldsNotice` component from collection form in favor of inline error label.

### Character Counters

- Routine form (BasicInfoScreen): name (50), detail (60), description (280).
- Collection form (CreateRoutineGroupModal): name (50), detail (60), description (280).

### Portuguese Accents

- Corrected all pt-BR strings throughout translations.ts (coleção, exercícios, séries, divisão, etc.).

## Findings by severity

### 1) High - Null-group model consistency

Status: Fixed.

Evidence:

- features/routines/components/CreateRoutineModal.tsx (submit payload now uses explicit nullable groupId)
- features/routines/hooks/useRoutineMutations.ts (mutation payload now uses explicit nullable groupId)

Risk:

- Residual risk reduced: null and undefined ambiguity removed in submit and mutation flow.

Recommendation:

- Keep contract as groupId: string | null in form + mutation payloads.
- Keep database write condition as "insert link only when groupId is non-null".

### 2) High - Edit flow can drop group links

Status: Accepted product behavior.

Evidence:

- features/routines/RoutinesTabScreen.tsx (edit routine loads one group link)
- features/routines/hooks/useRoutineMutations.ts (update deletes all links, re-inserts only one when present)

Risk:

- Editing a routine may silently remove other group associations.

Recommendation:

- Accepted by product rule: user freedom to reassign or clear group links during edit is intentional.
- Keep as-is unless requirements change to preserve many-to-many links on routine edit.

### 3) Medium - Expanded panel state key can collide by routine id

Status: Expanded state is keyed only by routineId.

Evidence:

- features/routines/RoutinesTabScreen.tsx
- features/routines/components/RoutineGroupDetailCard.tsx

Risk:

- Expand/collapse can mirror unexpectedly across sections sharing routine IDs.

Recommendation:

- Key expansion state by composite identity, e.g. groupId:routineId.

### 4) Medium - Important pagination tests are skipped

Status: Two tests intentionally skipped.

Evidence:

- features/routines/hooks/**tests**/usePaginatedExerciseLibrary.test.tsx (debounce test skipped)
- features/routines/hooks/**tests**/usePaginatedExerciseLibrary.test.tsx (stale-request test skipped)

Risk:

- Regressions in race/debounce behavior can ship unnoticed.

Recommendation:

- Re-enable both tests after stabilizing timing/mocks (fake timers + deterministic flush strategy).

### 5) Low - Hardcoded text in i18n-managed screen

Status: A few labels are hardcoded.

Evidence:

- features/routines/RoutinesTabScreen.tsx (+ GROUP, accessibility label/hint literals)

Risk:

- Mixed-language UX and weaker accessibility localization.

Recommendation:

- Move remaining literals to constants/translations.ts keys.

### 6) Low - Dead style token

Status: Unused style object present.

Evidence:

- features/routines/components/ExercisePickerScreen.tsx (catalogList style not consumed)

Risk:

- Small maintainability clutter.

Recommendation:

- Remove unused style block.

### 7) Low - Potential style compatibility issue

Status: Uses paddingBlock shorthand.

Evidence:

- features/routines/components/RoutineGroupDetailCard.tsx

Risk:

- Cross-platform RN support differences can appear depending on version.

Recommendation:

- Replace with explicit paddingTop/paddingBottom if compatibility issues show up.

## Validation notes

- Static problem check returned no immediate compile/lint errors.
- Test run in this session reported no executed tests; confidence remains mostly manual for now.

## Suggested cleanup order

1. Fix expansion state keying to composite identity.
2. Re-enable skipped pagination tests.
3. Remove hardcoded literals and dead styles.

## Owner checklist

- [x] Finalize routine/group relationship model for current beta (user can reassign or clear groups during edit).
- [x] Apply nullable groupId normalization.
- [x] Accept edit behavior that can replace existing multi-group links.
- [ ] Re-enable skipped tests and confirm deterministic pass.
- [ ] Run final format/lint/tests before next beta cut.

## Bug: Exercise search always falls back to English `name` column, breaking locale isolation

**File:** `features/routines/hooks/usePaginatedExerciseLibrary.ts` (lines 57–67)

### Root cause

The hook correctly selects the locale-aware column on line 57:

```ts
const searchColumn = locale === "pt-BR" ? exercises.searchPt : exercises.searchEn;
```

However, the OR condition that follows always includes `exercises.name` **regardless of locale**:

```ts
or(
  like(searchColumn, `%${normalizedQuery}%`), // ✅ locale-specific
  like(exercises.name, `%${normalizedQuery}%`), // ❌ always English base name
  like(exercises.muscleGroup, `%${normalizedQuery}%`),
);
```

`exercises.name` is the original (English) base name. For a pt-BR user, this means the search hits both `search_pt` **and** the English name column simultaneously, which:

- Can surface English-named exercises when the user typed a Portuguese term.
- Bypasses the normalization/accent-stripping purpose of `search_pt`/`search_en` (e.g. a query like "pressao" should match only via `search_pt` which has diacritics stripped, not via `exercises.name = "Pressão"`).

### Expected fix (not implemented yet)

Remove `exercises.name` from the OR. The search should rely **only on the locale-specific column** (`search_pt` for pt-BR, `search_en` for everything else), which already contains the normalized search terms for that language. `exercises.muscleGroup` can remain if muscle-group search is intentional.
