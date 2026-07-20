# STU-8: Modernize AuthPage styling

## Problem
The AuthPage uses a different color palette than the rest of the application:
- **Auth page:** indigo accent (`indigo-600`) on cool gray-50 background (`bg-gray-50`)
- **Dashboard + Onboarding:** rose accent (`rose-600`/`rose-700`) on warm stone-50 background (`bg-stone-50`)

This creates a jarring visual disconnect when users transition between login and the main app.

## Desired Outcome
The AuthPage visually matches the dashboard and onboarding pages by using:
- Rose accent color (`rose-600` primary, `rose-500` focus ring, `rose-200` borders)
- Warm stone-50 background (`bg-stone-50`)
- Consistent typography: `text-2xl font-bold` (not `text-3xl font-extrabold`)
- Consistent button height: `py-2.5` (not `py-2`)

## Scope
- Update color palette in `frontend/src/views/AuthPage.tsx` to match dashboard/onboarding
- No structural changes to layout or functionality
- No new components or dependencies

## Linear Ticket
[STU-8](https://linear.app/stuartcalverley/issue/STU-8)
