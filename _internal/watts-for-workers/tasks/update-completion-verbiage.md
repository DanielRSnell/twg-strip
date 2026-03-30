# Update Completion Screen Verbiage (Step 4)

**Status:** Todo
**Priority:** High
**File:** `src/layouts/components/interview/CompletionStep.tsx`

## Current

**Heading:** "You're All Set!"

**Body:**
> Thank you for completing the interview process. Our team will review your responses and be in touch soon.

**Gray box heading:** "WHAT HAPPENS NEXT?"

**Gray box body:**
> We'll review your responses and reach out via email or text with next steps. Keep an eye on your inbox.

## Requested

**Heading:** "You're All Set!" (keep)

**Body:**
> Thank you for taking the time to complete the initial interview for the Watts to Workers accelerated training program.
> If you have any questions, please reach out to us at WattstoWorkers@thiswayglobal.com

(The email should be a clickable mailto link)

**Gray box heading:** "NEXT STEPS" (centered, replaces "WHAT HAPPENS NEXT?")

**Gray box body:**
> We will review your application and follow up via email with next steps. If you have any questions in the meantime, please don't hesitate to contact us.
> Thank you again for your interest in Watts to Workers.

## Implementation Notes

- `CompletionStep.tsx` is currently shared across all interview clients with hardcoded copy
- The new verbiage is Watts-to-Workers-specific (mentions the program name and specific email)
- Options:
  1. **Config-driven (preferred):** Add a `completion` section to `ClientConfig` / JSON config with `heading`, `body`, `boxHeading`, `boxBody` fields. Pass as props to `CompletionStep`. Fall back to current generic copy if not provided.
  2. **Client prop:** Pass the client name and conditionally render. Less flexible.
- The email address `WattstoWorkers@thiswayglobal.com` should render as a `mailto:` link
