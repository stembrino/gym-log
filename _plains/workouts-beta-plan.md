# Workouts Beta Plan

## Goal

Ship the first real workouts flow with minimal risk:

- Start a workout from an existing routine.
- Keep the first interaction simple and fast.
- Respect the Retro-Tech design system (flat UI, monospace, high legibility, large touch targets, no visual noise).

## Scope For Beta Step 1

Step 1 only covers routine selection and workout start.

Out of scope for this step:

- Full set logging UX.
- Timer, PR alerts, analytics.
- Complex editing during active workout.

## Main User Story

As a user, I open Workouts and quickly choose one routine to start a new session.

## Two Selection Paths (Both Required)

1. Filter path (no collection selected)

- User sees routine filter chips (All, Favorites, Ungrouped).
- User browses routines list directly.
- User taps routine -> confirm -> start workout.

2. Collection path (collection selected)

- User selects one collection first.
- Routines list is constrained to that collection.
- User taps routine -> confirm -> start workout.

## UX Principles

- Do not overwhelm with too many controls at once.
- Show progressive disclosure:
  - First row: top-level filters.
  - Optional second row: collection chips (collapsible/clearable).
  - Then routine cards list.
- Keep strong focus on one final action: Start workout.

## Screen Structure (Workouts Tab)

1. Header block

- Title from i18n (`workouts.title`).
- Small helper text from i18n (new key for start flow guidance).

2. Filter row

- Reuse routine filter behavior where possible.
- Chips: All, Favorites, Ungrouped.

3. Collection selector

- Horizontal chips for routine collections.
- Include a clear action (`Clear collections`) to return to global list.

4. Routine result list

- Flat cards with:
  - Routine name
  - Optional detail/description (single line preview)
  - Small metadata (exercise count)
  - Primary CTA button: Start

5. Start confirmation (lightweight)

- Modal/sheet:
  - Routine name
  - Optional gym prefill preview
  - Confirm start action

## Data + Query Contract

Use existing routines hooks where possible to avoid parallel logic.

Minimum requirements:

- Read routines with current filter.
- Read routine groups for collection chips.
- Read routine exercises to prebuild workout exercise rows at start.

On confirm start:

1. Create `workouts` row with:

- `id`
- `date` (now)
- `gymId` (default gym if available, else null)
- `notes` null
- `duration` null (until finish)

2. Create `workout_exercises` rows from selected routine order.

3. Navigate to active workout detail/logging screen placeholder (can still be simple in this step).

## Design System Compliance Checklist

- Typography:
  - Monospace everywhere in this flow.
  - Section labels uppercase where appropriate.
- Colors:
  - Use tokenized palette only (retro theme), no hardcoded ad-hoc colors.
- Shape:
  - Radius 0-2 only.
  - No pills with excessive rounding.
- Surface:
  - No shadows, no blur, no gradients.
  - Separation by border only.
- Touch:
  - All interactive targets >= 44x44.
- Accessibility:
  - Icon-only actions must have accessibility labels.
  - Selected state should not rely on color alone.
- i18n:
  - All new strings must be translation keys in `pt-BR` and `en-US`.

## Suggested Implementation Order

1. Add Workout Start UI shell in Workouts tab

- Replace placeholder subtitle-only layout.
- Render filter row, collection chips, and routine list container.

2. Hook routines data into Workouts tab

- Reuse existing routines query strategy.
- Support both selection paths in one state model.

3. Add start action + confirmation modal

- Button on each routine card.
- Confirm creates workout + workout exercises.

4. Add navigation target for newly started workout

- Temporary detail/log screen is acceptable in beta step 1.

5. Add i18n keys and accessibility labels

- No hardcoded user-facing strings.

6. Add tests

- Unit/integration tests for:
  - Filter path selection.
  - Collection path selection.
  - Start action creates expected DB rows.

## State Model (Simple)

- `selectedFilter`: all | favorites | ungrouped
- `selectedCollectionId`: string | null
- `selectedRoutineIdForStart`: string | null
- `isStartConfirmOpen`: boolean

Rules:

- Selecting a collection applies collection constraint on routine list.
- Clearing collection returns to selectedFilter-only behavior.
- Start button always targets exactly one routine.

## Edge Cases For Beta

- No routines available for current filter -> empty state with clear guidance.
- Selected collection has zero routines -> show empty collection state + clear action.
- Routine has no exercises -> block start with friendly message.
- DB write failure on start -> toast/alert with retry.

## Definition Of Done (Step 1)

- User can open Workouts and start from a routine in under 3 taps after list is visible.
- Both paths work:
  - without collection
  - with collection
- New workout row and workout_exercises rows are persisted correctly.
- UI follows design-system constraints (flat, monospace, no visual clutter).
- New labels fully localized (`pt-BR` + `en-US`).
- Basic tests for selection and start flow are passing.

## Post-Step-1 Next Moves

- Active workout logging screen (sets/reps/weight editing).
- Finish workout action and duration calculation.
- Session history list and quick resume behavior.

## Technical Debt / Refactoring Notes

### DAO Layer Migration (Future)

Currently, query logic is split:

- `features/routines/queries/routineQueries.ts` — Read-only queries (newly extracted DAO layer)
- `features/routines/hooks/useRoutineMutations.ts` — Write operations (mutations)

**Refactoring TODO (not blocking beta):**

- Extract mutation logic from `useRoutineMutations.ts` into `features/routines/queries/routineMutations.ts`
- Move translation sync logic into DAO layer
- Update `useRoutineMutations` hook to call DAO functions
- Apply same pattern to exercises, gyms, and workouts features
- Benefit: Centralized DB logic; reusable across features; easier testing

**Current state:** Read queries are DAO-ready. Write ops can stay in hooks for now without impacting beta.

**Migration priority:** Low — after beta step 1 shipping.
