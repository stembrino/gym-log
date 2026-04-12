# Workouts Beta Plan

## Goal

Ship the first workouts entry flow in a way that makes LyteLog's product difference explicit:

- a user can start a workout right now without planning friction
- a user can also start from a training routine structure
- these are related concepts, but they are not the same action and should not be merged into one CTA

## Core Product Distinction

LyteLog should treat these as separate layers:

### Workout

The actual training session being executed now.

- execution layer
- immediate action
- can exist without a prior routine
- should feel fast and low friction

### Routine

A reusable workout template for one training day or one training shape.

- composition layer
- defines exercises and default order
- can be reused many times across sessions

### Training Routine

The broader structure that organizes multiple routines into a coherent block.

For the current technical model, this maps best to the routine group concept.

- organization layer
- groups related routines together
- gives continuity and context
- helps the user follow a plan instead of improvising each session

## Why This Matters

This distinction is part of the product value, not just a naming detail.

Many apps force one mental model:

- either everything starts from a template
- or everything is a manual log

LyteLog should support both:

- `INICIAR TREINO` for users who want to log a session now
- `INICIAR ROTINA DE TREINOS` for users who want to enter through a structured training flow

Recommended English labels:

- `START WORKOUT`
- `START TRAINING ROUTINE`

Suggested i18n keys:

- `workouts.actions.startWorkout`
- `workouts.actions.startTrainingRoutine`

## Product Relationship

Recommended relationship for the domain:

- training routine organizes routines
- routine defines one reusable training unit
- workout is the real executed session

In practical terms:

- `Training Routine -> Routine -> Workout`
- `Workout` can also be started directly without a routine

This keeps the model flexible without losing clarity.

## Beta Scope

Beta step 1 should focus on entry clarity, not on full workout logging depth.

### In Scope

- two separate primary actions in the Workouts tab
- one modal per action
- explicit product wording in i18n
- a screen structure that preserves the distinction
- documentation that guides future implementation

### Out Of Scope

- full set logging UX
- timer, PR alerts, analytics
- advanced editing during active workout
- routine continuity logic such as next-day recommendation
- trying to unify both flows under the same selection component

## Main User Stories

### Start Workout

As a user, I want to begin a workout immediately, even if I am not following a planned routine structure.

### Start Training Routine

As a user, I want to begin from a training routine so I can follow an organized plan instead of starting from scratch.

## UX Strategy For The Workouts Tab

The Workouts tab should start with two clear entry points and no conceptual mixing.

### Top-Level Actions

1. `INICIAR TREINO`
2. `INICIAR ROTINA DE TREINOS`

This screen should not depend on a shared filter/list UI in the first beta version.

The current recommendation is to keep the layout intentionally simple:

- two buttons
- two distinct modals
- no overloaded selection state
- no extra heading/subtitle if the actions already communicate the screen purpose clearly

## Recommended Meaning Of Each Entry Point

### 1. Start Workout

This should represent the fastest path to action.

Recommended semantics:

- user wants to train now
- user does not need to commit to a training routine first
- app may create an empty workout shell or a lightweight setup step
- exercises can be added after start

This flow should feel:

- direct
- fast
- manual-first

### 2. Start Training Routine

This should represent a guided entry through structure.

Recommended semantics:

- user chooses a training routine first
- the training routine contains one or more routines
- later, the app can ask which routine/day should be performed now
- the final outcome is still a workout session, but the entry is plan-driven

This flow should feel:

- guided
- structured
- continuity-oriented

## Important Product Rule

Do not hide the training routine flow inside the generic workout button.

Do not hide the direct workout flow inside the training routine flow.

They can share lower-level persistence helpers later, but the user-facing entry point should stay distinct.

## Information Architecture Guidance

Recommended high-level flow:

### Direct Workout Path

`Workouts tab -> Start Workout -> lightweight setup or immediate session creation -> active workout`

### Training Routine Path

`Workouts tab -> Start Training Routine -> select training routine -> select routine/day -> create workout from routine -> active workout`

This preserves a clear difference between planning and execution.

## Implementation Phases

### Phase 1 - Entry Shell

Goal: establish the product distinction in UI before deeper behavior.

- render the two main buttons in the Workouts tab
- add two separate placeholder modals
- use final i18n labels for both actions
- remove old content that implies there is only one unified start flow

### Phase 2 - Direct Workout MVP

Goal: make `Start Workout` useful with minimal friction.

- create a workout row
- prefill default gym if available
- navigate to active workout placeholder
- allow exercise selection after the workout exists

### Phase 3 - Training Routine MVP

Goal: make `Start Training Routine` useful without collapsing it into the direct workout flow.

- show available training routines
- open one training routine and list its routines
- let the user choose the routine/day for the current session
- create workout and workout exercise rows from that routine

### Phase 4 - Guided Continuity

Goal: strengthen the product differentiation.

- remember the last started routine inside a training routine
- suggest the next routine/day when relevant
- show light adherence or progression context later

## State Model Recommendation

Keep the state separate at the screen level.

Recommended beta state:

- `isStartWorkoutOpen: boolean`
- `isStartTrainingRoutineOpen: boolean`
- `selectedTrainingRoutineId: string | null`
- `selectedRoutineIdForStart: string | null`

Avoid a shared selection hook for both entry points in the first beta step.

If code is shared later, it should happen below the UX layer, not by forcing both flows into one UI state model.

## Architecture Guidance

### UI Layer

Keep separate components and intent boundaries.

Recommended direction:

- `StartWorkoutModal`
- `StartTrainingRoutineModal`

### Data Layer

Shared DB helpers are still fine where the outcome is the same.

Examples:

- create workout row
- create workout exercise rows from a routine
- load default gym

### Important Constraint

Do not reuse routine selection logic inside the direct workout entry just because both flows eventually create a workout.

That would blur the product distinction too early.

## UX Principles

- one mental model per button
- one modal per action
- low friction for direct workout start
- stronger structure for training routine start
- no overloaded CTA labels
- no assumption that every workout must come from a routine
- no assumption that training routine start should behave like a manual log flow

## Open Product Questions

These do not block phase 1, but should guide later decisions.

1. Should `Start Workout` create an empty workout immediately, or show a lightweight setup first?
2. Should `Start Training Routine` first show recent training routines, or always list all of them?
3. Should a training routine have an optional recommended order for routines/days?
4. Should the app later allow attaching a manually started workout to a training routine after the fact?

## Definition Of Done For This Direction

The direction is working when:

- the team can explain the difference between workout and training routine in one sentence
- the Workouts tab has two distinct entry points
- each entry point has its own modal and intent
- the direct workout path does not depend on routine selection
- the training routine path remains plan-driven
- new code can evolve without re-merging these concepts

## Summary Decision

LyteLog should not treat workout and training routine as two labels for the same start flow.

The product should make this explicit:

- workout = execute now
- routine = reusable training day
- training routine = organized structure of routines

That distinction is the guide for the next UI and architecture steps.
