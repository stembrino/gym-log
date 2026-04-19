# Logbook Share And Export Plan

## Goal

Add two output actions to the Logbook without changing its core browsing flow:

- per-workout share/copy action directly in each logbook card
- top-level export action near the filters for exporting the visible logbook data as CSV

The intent is to make Logbook useful both for quick social sharing and for structured data export.

## Desired UX

### 1. Per-card share/copy action

Each logbook card should expose a quick action similar to the post-finish workout action.

Recommended behavior:

- add one icon/button in the card header action row
- action builds a text summary of that completed workout
- open native share sheet first
- if needed later, split into `Share` and `Copy`

Why start with native share:

- reuses an existing pattern already present in workouts
- lets the user send to WhatsApp, Messages, email, etc.
- avoids adding clipboard-specific UX first if not necessary

### 2. Top-level export action

Add an action near the existing filters in Logbook.

Recommended first UI:

- a small top-right `...` action button or export button in the header area
- opens a compact action menu
- first menu item: `Export CSV`

Future-friendly menu items:

- `Export CSV`
- `Share selected filters`
- `Copy summary`

## Reuse Already Available In The App

### Existing sharing logic

There is already a text share flow in:

- `features/workouts/InProgressWorkoutScreen.tsx`
- `features/workouts/components/PostFinishQuickActionsSheet.tsx`

Relevant reusable concepts:

- `buildWorkoutShareText(...)`
- `Share.share({ message })`
- alert/error handling for share failure

Recommendation:

- extract workout text formatting into a shared helper
- make it work for both active workout rows and logbook rows

### Existing menu/action primitives

There is already an action menu component in the project:

- `components/ActionMenu.tsx`

Recommendation:

- use `ActionMenu` for the top-level export trigger instead of inventing a new menu pattern

## Product Scope

### Phase 1 - Card share

Add a share action per workout card.

In scope:

- one new icon/button in `LogbookWorkoutCard`
- create text summary from completed workout data already loaded in Logbook
- trigger native share sheet
- error alert if share fails

Out of scope:

- clipboard-only flow
- image export
- PDF export

### Phase 2 - CSV export

Add export for currently visible logbook result set.

Recommended meaning of export:

- export the rows matching the current active filters
- not only the currently paginated items on screen if avoidable

Important product rule:

- exported data should respect active filters such as gym and future routine/exercise filters

## CSV Shape Recommendation

Use one row per logged set.

Why:

- easier to analyze in spreadsheets
- handles repeated exercises and multiple sets cleanly
- future-proof for exercise-level filters

Recommended columns:

- workout_id
- workout_date
- created_at
- routine_name
- gym_name
- duration_minutes
- exercise_name
- set_order
- reps
- weight
- completed
- total_load_for_set

Optional later:

- locale-specific formatted labels
- exercise_id
- routine_id

## Data Layer Plan

### 1. Share from card

No new DB query is strictly required for the first version.

Reason:

- `LogbookWorkoutItem` already contains enough data to build a readable text share summary

Needed work:

- add formatter helper for `LogbookWorkoutItem -> string`
- keep output close to the existing workout share text format

### 2. Export CSV

This should not rely only on paginated screen state.

Recommended approach:

- create a dedicated export query/helper in Logbook DAO
- pass the same filter object used by the listing flow
- fetch all matching workouts for export
- flatten workout + exercise + set rows into CSV rows in a dedicated mapper

Recommended future API shape:

- `getLogbookExportRows({ filters, locale })`
- `buildLogbookCsv(rows)`

## Filter Compatibility

This feature should align with the future accumulated filter model.

Target filter shape:

- gym
- routine
- exercise

Export should follow the exact same filter source as the visible logbook list.

That means this feature becomes much cleaner after the Logbook filter refactor into a unified filter object.

## UI Integration Plan

### Logbook card

File:

- `features/logbook/components/LogbookWorkoutCard.tsx`

Add:

- share icon/button in header action row
- callback prop like `onShare`

### Logbook screen

File:

- `features/logbook/LogbookTabScreen.tsx`

Add:

- top-right header/export action near filters
- action menu open/close state
- share callback per card
- export callback from menu

### Logbook hook

File:

- `features/logbook/hooks/usePaginatedLogbook.ts`

Later adjust for:

- unified filter object
- export using same active filters

## Technical Steps

### Step 1 - Extract share formatter

- create a shared helper for workout-to-text formatting
- support both active workout data and logbook data, or create a logbook-specific formatter with the same visual style

### Step 2 - Add per-card share action

- add prop to `LogbookWorkoutCard`
- wire `Share.share` from `LogbookTabScreen`
- show alert on failure

### Step 3 - Add top action menu

- add action trigger near filters
- open `ActionMenu`
- add `Export CSV` option

### Step 4 - Implement export query

- create dedicated export rows function in logbook DAO
- use active filters
- fetch all matching workouts for export

### Step 5 - Build CSV string

- map export rows into CSV
- escape commas, quotes, and line breaks safely

### Step 6 - Share/export file

First version options:

- share CSV text directly if small
- or write temp file and share the file if file export is already supported in the app stack

Recommended first decision:

- prefer temp CSV file export if available
- fallback to share plain text only for summary, not for full CSV

## Dependencies To Verify During Implementation

- whether the app already uses Expo FileSystem or Sharing for file-based export
- whether CSV should use UTF-8 BOM for Excel compatibility
- whether the export action should include only completed sets or all sets

## Open Product Questions

1. Should card action be `Share` only, or `Copy` and `Share` separately?
2. Should CSV export include only filtered results or all workouts?
3. Should CSV export include unchecked sets, or only completed sets?
4. Should top menu eventually include PDF/image share, or stay data-first?

## Recommended First Delivery

Ship in this order:

1. Per-card share using the current logbook item data
2. Top-right action menu shell
3. CSV export honoring current gym filter
4. Expand export to routine/exercise filters after unified filter model lands

## Complexity Assessment

### Card share

Low complexity.

- data already exists in memory
- share pattern already exists in workouts

### CSV export with current structure

Medium complexity.

- requires dedicated flattening logic
- should avoid relying on paginated visible items only

### CSV export with future accumulated filters

Medium-high complexity if filters remain fragmented.

Much cleaner once Logbook uses a unified filter object.
