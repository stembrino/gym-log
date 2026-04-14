# Beta TODO

## Core focus: start a workout fast

### 1. Routine — create just-in-time

- Remove the requirement to have a routine plan before starting a workout
- When starting a workout, let the user pick an existing routine OR create one inline (just-in-time)
- Assume users will either reuse a saved routine or build on the fly — don't force pre-planning

### 2. Exercise list — multi-select + filter fix

- Today the panel closes after selecting one exercise — fix to keep panel open
- Support multi-select so the user can pick several exercises in one go
- Category filter must persist while the panel is open (don't reset on each pick)
- Filter by muscle group should work as a multi-select chip group

### 3. Exercise categories

- Fix/review exercise category labels used as filters
- Make sure they match the `muscleGroup` values in the DB

### 4. Exercise reorder in active workout

- Remove the image preview from the reorder row — it adds noise and confusion
- Drag handle must span the full row width so the entire row is draggable, not just a handle icon
