# Update Email Step, Header Logo, and Privacy Disclosure

**Status:** Todo
**Priority:** High
**Files:**
- `src/pages/[client]/interview.astro` - Header logo logic
- `src/layouts/components/interview/EmailStep.tsx` - Email step copy + disclosure
- `src/config/interviews/watts-to-workers.json` - Subtitle text, logo path

## 1. Duplicate Logo Fix

**Current:** Header shows TWG logo + client logo side by side. But `watts-to-workers.json` has `"logo": "/images/logo.svg"` (same as TWG), so it appears twice.

**Fix:**
- When a Watts to Workers logo is created, update the `logo` field in `watts-to-workers.json` to point to it
- If no client logo is provided (or it matches the TWG logo), only show it once. Consider adding logic in `interview.astro` to skip the divider + second logo when `clientConfig.logo === "/images/logo.svg"`
- **Blocked on:** Watts to Workers logo asset

## 2. Update Subtitle Verbiage

**Current** (in `watts-to-workers.json` `subtitle` field):
> Watch the video below and complete the screening questions to continue.

**Requested:**
> Watch the video below and complete the screening questions to move forward in the process

## 3. Update Email Step Copy

**Current** (`EmailStep.tsx`):
- Heading: "Let's get started"
- Body: "Enter your email address to begin the interview process. If you've started before, we'll pick up right where you left off."

**Requested:**
- Heading: "Let's Get Started" (capitalize "Get")
- Body: "Enter your email address to begin the initial interview and watch the informational video. If you have already started, you will be able to pick up right where you left off."

**Note:** `EmailStep.tsx` is shared across clients. The new copy is generic enough to work for all clients, so a direct update is fine (no config needed).

## 4. Privacy/Email Disclosure

**Requested:** Add a disclosure statement on the email step indicating the email is only for communication with the individual and will not be shared or sold to any 3rd party.

**Pending:** Client to confirm whether they'll provide specific legal language or if we should draft it. Placeholder approach:
- Add small-print text below the email input or Continue button
- Something like: "Your information will only be used to communicate with you about this opportunity and will not be shared with or sold to any third parties."
- May need legal review before going live
