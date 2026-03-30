# Update Text Message Consent Verbiage (Question 5)

**Status:** Todo
**Priority:** High
**File:** `src/config/interviews/watts-to-workers.json`
**Component:** `src/layouts/components/interview/FormStep.tsx` (may need layout changes for disclaimer text)

## Current

**Label:**
> We've found the best way to communicate is sometimes text messages. May we text you?

No disclaimer text shown.

## Requested

**Label:**
> We've found that text messaging is often the easiest way to stay in touch. Would you like to receive updates via text?

**Disclaimer (below the Yes/No buttons):**
> By selecting "Yes," you agree to receive text messages from Watts to Workers. Message and data rates may apply. Message frequency may vary. You can opt out at any time by sending an email to WattstoWorkers@thiswayglobal.com.

## Implementation Notes

- The label change is a simple config update in `watts-to-workers.json` (question id: `textMessageConsent`)
- The disclaimer text is new: the current `yesno` question type has no support for showing fine-print/disclaimer text beneath the buttons
- Options:
  1. Add a `disclaimer` field to the question config schema and render it in `FormStep.tsx` for any question that has one
  2. Hard-code it for the `textMessageConsent` question only (less flexible)
- Option 1 is preferred since it keeps the multi-tenant system generic
