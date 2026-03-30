# Update Optional Field Skip Text on Last Question

**Status:** Todo
**Priority:** Low
**File:** `src/layouts/components/interview/FormStep.tsx`

## Current

When a question is optional, the hint text reads:
> Optional. Press Next to skip.

But on the last question (Q9, referral), the button says "Submit" not "Next".

## Requested

The hint should say "Optional. Press Submit to skip." when it's the last question.

## Implementation

In `FormStep.tsx` (line ~307-309), the optional hint is hardcoded:
```tsx
{!question.required && (
  <p className="mt-2 text-center text-xs text-light">
    Optional. Press Next to skip.
  </p>
)}
```

Change to use the `isLast` variable that already exists:
```tsx
Optional. Press {isLast ? "Submit" : "Next"} to skip.
```
