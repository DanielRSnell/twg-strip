# "Not Interested" Exit Flow (Question: Still Interested?)

**Status:** Todo
**Priority:** High
**Files:**
- `src/config/interviews/watts-to-workers.json` - Add exit config to question
- `src/layouts/components/interview/types.ts` - Add exit/redirect types to QuestionConfig
- `src/layouts/components/interview/FormStep.tsx` - Handle conditional exit
- `src/layouts/components/interview/ExitStep.tsx` - New component (or extend CompletionStep)
- `src/layouts/components/InterviewFunnel.tsx` - Handle early exit state

## Current

"Are you still interested in the training opportunity?" is a simple yes/no. Selecting "No" and clicking Next just continues to the next question.

## Requested

If user selects **"No"**, redirect them to an exit/thank-you screen instead of continuing the form.

**Exit screen content:**

**Heading (centered):** "Thank You"

**Body:**
> Thank you for taking the time to learn more about the Watts to Workers opportunity and for participating in the process.
>
> We understand that this opportunity may not be the right fit for everyone. Based on your selection, you will be removed from future Watts to Workers program communications.
>
> We appreciate your interest and wish you the best in your future endeavors.

## Implementation Notes

This introduces **conditional branching** to the form engine, which currently only supports linear progression.

**Option 1 (config-driven, preferred):**
Add an `exitOn` field to `QuestionConfig`:
```json
{
  "id": "stillInterested",
  "label": "Are you still interested in the training opportunity?",
  "type": "yesno",
  "required": true,
  "exitOn": {
    "value": "No",
    "heading": "Thank You",
    "body": "Thank you for taking the time to learn more about the Watts to Workers opportunity..."
  }
}
```

When `goNext()` is called and the answer matches `exitOn.value`:
1. Fire a tracking event (`funnel_exited` with reason + question context)
2. Show the exit screen instead of advancing to the next question
3. Mark state as complete (or a new `exited` status) so they don't get stuck in a loop on return

**Option 2:** Separate `ExitStep` component similar to `CompletionStep` but with different styling (no confetti, no "You're All Set").

**Backend consideration:** The Umbral webhook should receive a `funnel_exited` event so the team knows to remove this person from communications. This may also need to trigger an actual unsubscribe action in the backend.
