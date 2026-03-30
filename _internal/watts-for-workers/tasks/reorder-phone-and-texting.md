# Reorder: Text Opt-In Before Phone Number + Phone Disclosure

**Status:** Todo
**Priority:** High
**File:** `src/config/interviews/watts-to-workers.json`

## Current Question Order (Q3-Q5)

3. Phone number (tel)
4. Still interested? (yesno)
5. Text message consent (yesno)

## Requested Question Order

3. Still interested? (yesno) -- moved up, has exit behavior (see separate task)
4. Text message consent (yesno) -- ask opt-in first
5. Phone number (tel) -- only ask after they've opted in

## Implementation

Config-only change: reorder the questions array in `watts-to-workers.json`. The form engine is index-based, so reordering just works.

## Phone Number Disclosure

Add a disclaimer below the phone number input:
> Your phone number will only be used for communication from us and will not be shared with or sold to any third parties.

This uses the same `disclaimer` field proposed in the text consent task. Both questions would benefit from the same feature.
