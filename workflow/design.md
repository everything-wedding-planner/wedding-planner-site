# STU-5: Fix Auth Flow — Design Spec

## Overview

This is primarily a functional fix, not a visual redesign. The design spec covers error handling UI and loading states added to the existing AuthPage.

## Error Handling UI

### Error Message Display

**Location:** Above the form, below the header

**Component:**
```tsx
{error && (
  <div className="rounded-md bg-red-50 p-4">
    <div className="flex">
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">{error}</h3>
      </div>
    </div>
  </div>
)}
```

**Styling:**
- Background: `bg-red-50` (Tailwind)
- Text: `text-red-800`
- Border radius: `rounded-md`
- Padding: `p-4`
- Matches existing Tailwind v4 utility classes used in the project

**Behavior:**
- Clears when user switches between login/signup
- Clears on new form submission
- Displays API error message from `{ error: "..." }` response

### Loading State

**Button disabled during submission:**
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? "Signing in..." : "Sign in"}
</button>
```

**State:** Add `isSubmitting` boolean to component state.

## Form Validation UI

### Confirm Password Mismatch

**Location:** Below the confirm password field

**Component:**
```tsx
{formData.confirmPassword && formData.password !== formData.confirmPassword && (
  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
)}
```

**Behavior:**
- Shows in real-time as user types (only after they've started typing in confirm field)
- Prevents form submission if passwords don't match

## No Visual Redesign

The existing form styling (indigo-600 primary, gray-50 background, rounded-xl card) remains unchanged. This ticket focuses on functionality, not aesthetics. (STU-8 covers auth page modernization.)

## Accessibility

- Error messages use `role="alert"` for screen readers
- Disabled button has `disabled` attribute (not just visual)
- Color contrast meets WCAG AA (red-800 on red-50 passes)

## Files Affected

| File | Design Changes |
|------|----------------|
| `frontend/src/views/AuthPage.tsx` | Add error banner, loading state, validation messages |

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-5
