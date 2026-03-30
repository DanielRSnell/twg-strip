# Multi-Select for Training Sessions (Question 6)

**Status:** Todo
**Priority:** High
**Files:**
- `src/config/interviews/watts-to-workers.json` - Change type + update label
- `src/layouts/components/interview/types.ts` - Add `multiselect` to `QuestionConfig.type`
- `src/layouts/components/interview/FormStep.tsx` - Add `multiselect` rendering and state handling

## Current

- **Type:** `select` (single selection only)
- **Label:** "Which training session(s) are you available to participate in?"
- Clicking a new option replaces the previous selection
- Answer stored as a single string in `Record<string, string>`

## Requested

- **Type:** `multiselect` (toggle multiple selections)
- **Label:** "Which training session(s) are you available to participate in? (Select all that apply)"
- Users can select/deselect multiple options
- Visual: selected options get the active style (blue border), multiple can be active at once

## Implementation Notes

1. **types.ts**: Add `"multiselect"` to the `QuestionConfig.type` union
2. **FormStep.tsx**:
   - Add a `handleMultiSelect(value)` that toggles values in a set
   - Store as comma-separated string (e.g. `"Late March, Early April, Flexible"`) to fit existing `Record<string, string>` shape, or as JSON array string
   - Render like `select` but with toggle behavior instead of replace
   - Validation: at least one option selected when `required: true`
3. **watts-to-workers.json**: Change question type from `select` to `multiselect`, update label
4. **Consider**: If "Flexible" is selected, should it clear other selections (or vice versa)? Needs clarification.
