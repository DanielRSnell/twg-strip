# Update Location Placeholder to Include Country

**Status:** Todo
**Priority:** Low
**File:** `src/config/interviews/watts-to-workers.json`

## Current

- **Placeholder:** "City, State"

## Requested

- **Placeholder:** "City, State, Country"

## Implementation

Config-only change in `watts-to-workers.json`:
```json
{
  "id": "currentLocation",
  "placeholder": "City, State, Country"
}
```

## Context

International applicants are submitting without country info since the placeholder only suggests City/State.
