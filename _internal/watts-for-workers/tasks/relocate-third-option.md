# Add Third Option to Relocation Question (Question 8)

**Status:** Todo
**Priority:** Medium
**File:** `src/config/interviews/watts-to-workers.json`

## Current

- **Type:** `yesno` (two buttons: Yes / No)
- **Label:** "Are you willing to relocate for the right opportunity?"

## Requested

- Add a third option: "Possibly, for the right job"
- This means changing from `yesno` to `select` with three explicit options

## Implementation

Change in `watts-to-workers.json`:

```json
{
  "id": "willingToRelocate",
  "label": "Are you willing to relocate for the right opportunity?",
  "type": "select",
  "required": true,
  "options": ["Yes", "No", "Possibly, for the right job"]
}
```

No component changes needed. The existing `select` type already renders a list of option buttons, which fits the three-option layout well.
