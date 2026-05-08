# Data Backup And Import Plan

## Current Status

### Backup export

Implemented and manually validated.

Current behavior:

- available from Settings behind a feature flag
- implemented as an isolated feature under `features/data-export/`
- exports a full JSON backup file of the current relational data snapshot
- writes the file locally and opens the native share flow

Result:

- export is done
- user-tested
- code-reviewed and approved for current scope

## Current Architecture

The backup export is intentionally decoupled by layer:

- `features/data-export/queries/`
  - reads the database snapshot
- `features/data-export/lib/`
  - builds the file name and serializes the payload
- `features/data-export/hooks/`
  - orchestrates export generation and native sharing
- `features/data-export/components/`
  - exposes the Settings entry row

Settings integration is minimal:

- feature flag in `constants/featureFlags.ts`
- UI entry added in `features/settings/SettingsScreen.tsx`

## Export Scope

The current backup export includes the relational app data needed for a full restore flow later:

- gyms
- exercises
- routines
- routine_exercises
- routine_tags
- routine_tag_links
- entity_translations
- workouts
- workout_exercises
- sets

This is intentionally a full backup snapshot, not a partial entity export.

## Product Decision

Keep two different export concepts separate:

- backup export
  - full snapshot for restore / migration between devices
- feature export
  - domain-specific output such as Logbook CSV or workout sharing

Do not mix these two ideas in the same flow.

## Why This Direction

This app uses a relational model with important dependencies between entities.

That means row-level or table-level partial import/export is risky because:

- workouts depend on workout_exercises and sets
- workouts can reference gyms and routines
- routines depend on routine_exercises and tags
- translations depend on matching entity identifiers

So the safest first step is a full backup export.

## Next Step

### Import backup

This should be the next feature in the same product line.

Recommended scope:

- import from selected JSON backup file
- validate backup format and version before writing
- restore data transactionally
- define product behavior clearly before implementation:
  - replace local data completely
  - or merge with conflict rules

Recommended first product choice:

- start with `Replace local data from backup`

Reason:

- simpler mental model for users
- safer than implicit merge rules
- much easier to validate and support

## Notes

Export itself needs less validation than import.

That is acceptable for the current phase because export is read-oriented and does not mutate local data.

Import will need stronger safeguards, especially for:

- file shape validation
- schema version compatibility
- transaction boundaries
- replace vs merge behavior
- user confirmation and destructive action messaging

## Import Goal

Add a full backup restore flow that can safely import a previously exported Gym Log backup file.

Primary use cases:

- restore data on a new device
- recover after reinstall
- recover from accidental local data loss

Non-goal for the first version:

- partial import by entity
- CSV import
- merge from multiple backups
- smart conflict resolution across local and imported data

## First Product Decision

Start with one import mode only:

- `Replace local data from backup`

Do not start with merge.

Why:

- much safer for a relational schema
- simpler user expectation
- easier to validate before writing
- easier to support if something goes wrong

## Recommended Feature Structure

Keep import separate from export but in the same product area.

Recommended structure:

- `features/data-import/components/`
  - Settings row
  - confirmation modal
  - compatibility result UI
- `features/data-import/hooks/`
  - import orchestration hook
- `features/data-import/lib/`
  - file parsing
  - compatibility checker
  - validation helpers
  - restore plan builder
- `features/data-import/queries/`
  - optional local-state inspection helpers
- `features/data-import/restore/`
  - transactional restore implementation
- `features/data-transfer/types/`
  - shared backup payload types used by both export and import

Longer term, the shared backup contract can move out of export-specific files into a common data transfer folder.

## Backup Contract

The import flow should rely on an explicit backup contract, not just on whatever JSON is present.

Recommended top-level shape:

```ts
type GymLogBackupFile = {
  format: "gym-log-backup";
  version: 1;
  exportedAt: string;
  appVersion?: string;
  schemaVersion?: number;
  data: {
    gyms: GymRow[];
    exercises: ExerciseRow[];
    routines: RoutineRow[];
    routineExercises: RoutineExerciseRow[];
    routineTags: RoutineTagRow[];
    routineTagLinks: RoutineTagLinkRow[];
    entityTranslations: EntityTranslationRow[];
    workouts: WorkoutRow[];
    workoutExercises: WorkoutExerciseRow[];
    sets: SetRow[];
  };
  counts: {
    gyms: number;
    exercises: number;
    routines: number;
    routineExercises: number;
    routineTags: number;
    routineTagLinks: number;
    entityTranslations: number;
    workouts: number;
    workoutExercises: number;
    sets: number;
  };
};
```

Recommended follow-up improvement:

- add `schemaVersion` to export as soon as import starts being implemented
- optionally add `backupId` for support/debugging later

## Import Pipeline

The import flow should be staged.

### Stage 1 - File selection

User action:

- tap `Import backup` in Settings
- open document picker
- select one JSON file

Requirements:

- only accept JSON-like files for the first version
- reject empty selection cleanly

### Stage 2 - Parse

Responsibilities:

- read selected file as text
- parse JSON safely
- return structured parse result

Failure examples:

- unreadable file
- invalid JSON
- truncated backup

Suggested output:

- `ok`
- `parse_error`
- `unsupported_file`

### Stage 3 - Contract validation

This is a shape check, before deeper compatibility or integrity checks.

Check:

- top-level object exists
- `format === "gym-log-backup"`
- `version` exists and is supported
- required `data` collections exist
- each required collection is an array
- `counts` exists if required by the contract

This stage should not yet trust row contents.

Suggested output:

- `valid_contract`
- `invalid_contract`

### Stage 4 - Compatibility checker

This stage answers:

- is this backup from the same import family?
- is the backup version supported by this app build?
- can this app restore it directly?

Recommended compatibility result shape:

```ts
type BackupCompatibilityResult = {
  status: "compatible" | "compatible-with-warnings" | "incompatible";
  issues: BackupIssue[];
  warnings: BackupIssue[];
  backupVersion: number | null;
  expectedVersion: number;
  backupSchemaVersion?: number | null;
  appSchemaVersion?: number | null;
};
```

Compatibility checks should include:

- `format` matches expected backup family
- `version` is known by the app
- `version` is not newer than supported import logic
- `schemaVersion` is known when available
- `schemaVersion` is not ahead of the current app schema
- required collections for that backup version are present

Recommended compatibility policy:

- same `format` + supported `version` -> continue
- older supported version -> continue, optionally run normalization
- newer unsupported version -> block import
- missing `schemaVersion` for old exports -> continue with warning if version 1 contract matches expected shape

### Stage 5 - Semantic validation

This is the deep checker.

Goal:

- verify the backup is internally coherent before any local mutation happens

Checks should include:

- every row has required primary key fields
- primary keys are unique within each collection
- composite keys are unique where applicable
- all foreign keys resolve inside the backup payload
- nullable references are either null or resolvable
- values that should be booleans/strings/numbers are structurally valid
- counts match actual array lengths

Important relational checks for this app:

- `workouts.gym_id` points to existing gym or is null
- `workouts.source_routine_id` points to existing routine or is null
- `workout_exercises.workout_id` points to existing workout
- `workout_exercises.exercise_id` points to existing exercise
- `sets.workout_exercise_id` points to existing workout_exercise
- `routine_exercises.routine_id` points to existing routine
- `routine_exercises.exercise_id` points to existing exercise
- `routine_tag_links.routine_id` points to existing routine
- `routine_tag_links.tag_id` points to existing routine_tag
- `entity_translations.entity_id` points to an existing entity when the entity type is import-supported

Suggested output:

- `valid_backup`
- `invalid_backup`

### Stage 6 - Normalization

Only run this if compatibility logic says it is needed.

Examples:

- fill absent optional top-level metadata with defaults
- normalize missing arrays to empty arrays only when contract allows it
- coerce legacy fields when a safe deterministic mapping exists

Do not use normalization to guess ambiguous data.

If the backup is structurally ambiguous, block import.

### Stage 7 - Pre-import summary

Before destructive confirmation, show the user a summary.

Suggested summary:

- backup date
- backup version
- counts per entity
- import mode: `Replace local data`
- warning if current local data will be removed

If compatibility warnings exist, surface them here.

### Stage 8 - Explicit destructive confirmation

This must be a separate confirmation step.

Suggested copy direction:

- this will replace current local data
- this action cannot be undone unless the user exports again first

Recommended UX:

- primary CTA: `Import and replace`
- secondary CTA: `Cancel`
- optional safety CTA before this step: `Export current data first`

### Stage 9 - Transactional restore

This is the mutation stage.

Requirements:

- wrap the entire restore in one DB transaction
- either restore everything or restore nothing

Recommended strategy for first version:

1. clear local user-owned data in dependency-safe order
2. insert imported rows in dependency-safe order
3. commit only if all inserts succeed

This delete-then-insert executor is only for `replace` mode. A future `incremental` mode should reuse the same validation and planning stages, but swap in a different executor that resolves inserts, updates, and conflicts without wiping local data first.

Recommended delete order:

- sets
- workout_exercises
- workouts
- routine_tag_links
- routine_exercises
- routines
- routine_tags
- entity_translations
- gyms
- exercises

Recommended insert order:

- gyms
- exercises
- routines
- routine_tags
- routine_exercises
- routine_tag_links
- workouts
- workout_exercises
- sets
- entity_translations

Note:

- this order may be adjusted slightly depending on actual FK constraints and desired handling of translations
- if some exercises are app-seeded/system-owned rather than fully user-owned, define that rule clearly before destructive restore

### Stage 10 - Post-import refresh

After commit:

- refresh app state
- invalidate/reload affected screens
- close import UI
- show success message with restored counts summary

If restore fails:

- rollback transaction
- keep existing local data untouched
- show a restore failure message

## Compatibility Strategy

The compatibility checker should be explicit and conservative.

### Compatible

- same backup format
- supported backup version
- schema is same or older and supported by a migration/normalization path

### Compatible With Warnings

- older backup without optional metadata such as `schemaVersion`
- older backup where fields can be safely defaulted
- minor non-blocking metadata mismatch

### Incompatible

- wrong `format`
- unsupported future `version`
- unknown mandatory collections
- unsupported schema gap
- broken relational integrity

## Integrity Rules

Import should fail hard if any of these are true:

- malformed top-level payload
- duplicated primary keys
- unresolved non-null foreign keys
- invalid composite key duplicates
- counts materially disagree with actual arrays
- unsupported entity type referenced by translations when the app cannot safely map it

Import may continue with warning if any of these are true:

- missing optional metadata
- absent empty collections in a legacy version where defaults are safe
- extra unknown top-level metadata fields

## Local Data Policy

The first version should define local data policy very clearly.

Recommended first rule:

- imported backup replaces the current local user data snapshot

Questions to lock before implementation:

- should system exercises be left untouched if they also exist locally?
- should import overwrite `is_default` on gyms exactly as stored in backup?
- should `__data_patches` be excluded from import entirely?
- should `muscle_groups` remain app-seeded instead of backup-owned?

Recommended initial policy:

- do not import internal control tables such as `__data_patches`
- do not make import depend on `muscle_groups` if those are app-defined constants/seeded data
- restore only the user-relevant relational domain already used by export

## Checker Responsibilities

Split checker logic into narrow units.

Recommended modules:

- `parseBackupFile(...)`
- `validateBackupContract(...)`
- `checkBackupCompatibility(...)`
- `validateBackupIntegrity(...)`
- `normalizeBackupPayload(...)`
- `buildRestorePlan(...)`

This avoids one giant import function and keeps the feature testable.

## Suggested Restore API

```ts
type RestoreMode = "replace" | "incremental";

type ImportBackupResult =
  | { status: "success"; restoredCounts: Record<string, number> }
  | { status: "cancelled" }
  | { status: "incompatible"; issues: BackupIssue[] }
  | { status: "invalid"; issues: BackupIssue[] }
  | { status: "failed"; message: string };

async function importBackupFromFile(
  fileUri: string,
  mode: RestoreMode = "replace",
): Promise<ImportBackupResult>
```

Possible lower-level API split:

- `loadBackupFile(fileUri)`
- `inspectBackup(payload)`
- `buildRestorePlan(payload, mode)`
- `restoreBackup(payload, mode)`

For the first shipped version, only `replace` needs to execute.

Still shape the pipeline so `incremental` can be added later without changing the backup file contract or top-level import entry point:

- inspect first, mutate later
- build an explicit plan object before any writes
- keep entity ordering and conflict handling inside planner/executor layers
- return a clear unsupported-mode result if `incremental` is requested before implementation exists

## UX Flow Recommendation

Recommended first UX in Settings:

1. `Import backup`
2. choose file
3. run parse + contract validation + compatibility + integrity checks
4. show summary screen/modal
5. destructive confirm
6. restore transactionally
7. show success or failure state

Do not start with a silent one-tap import.

## Testing Plan

### Unit tests

- valid version 1 backup parses successfully
- invalid JSON fails cleanly
- wrong `format` is rejected
- unsupported future `version` is rejected
- duplicate IDs are rejected
- broken foreign keys are rejected
- missing optional metadata gives warning but can proceed when allowed
- counts mismatch is rejected
- normalization path for older supported payloads works

### Integration tests

- import into empty database succeeds
- import into populated database replaces data correctly
- failed insert rolls back transaction fully
- restored rows match the backup counts

### Manual QA

- export on device A and import on device B
- import same backup twice
- cancel at confirmation step
- import malformed file
- import unsupported future backup

## Suggested Delivery Stages

### Phase 1 - Contract hardening

- move backup types into shared folder
- add `schemaVersion` to export
- lock version 1 contract

### Phase 2 - Checker pipeline

- file parse
- contract validation
- compatibility checker
- integrity validation
- import summary model

### Phase 3 - Restore engine

- transactional replace import
- dependency-safe delete/insert order
- app refresh after restore

### Phase 4 - Settings UX

- feature flag
- import row
- file picker
- summary and confirm modal
- success/failure messaging

### Phase 5 - Hardening

- tests
- legacy normalization if needed
- support notes for future backup versions

## Out Of Scope For First Import Version

- merge mode
- per-entity import
- CSV import
- background import queue
- selective conflict resolution
- partial restore of only workouts or only routines

Even though incremental execution is out of scope for V1, the API and internal boundaries should assume it will exist later.

## Final Recommendation

The first import release should be:

- full-backup only
- replace-local-data only
- heavily checked before mutation
- fully transactional during restore
- clearly separated from analytics/share exports

The implementation should also keep validation, planning, and execution separated so an incremental mode can be added later with minimal churn.

That keeps the product understandable and keeps the implementation aligned with the app's relational data model.