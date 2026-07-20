# STU-8: Modernize AuthPage styling

## Problem
The AuthPage uses a different color palette than the rest of the application:
- **Auth page:** indigo accent (`indigo-600`) on cool gray-50 background (`bg-gray-50`)
- **Dashboard + Onboarding:** rose accent (`rose-600`/`rose-700`) on warm stone-50 background (`bg-stone-50`)

This creates a jarring visual disconnect when users transition between login and the main app.

## Proposed Solution
1. **Create a centralized styleguide** using Tailwind v4's CSS-first configuration (`@theme` directive) to define brand colors and design tokens
2. **Update AuthPage** to use the new styleguide tokens instead of hardcoded Tailwind classes
3. **Ensure all future components** use the same tokens for consistency

## Key Changes

### Styleguide (New)
- Define brand color palette in `frontend/src/index.css` using `@theme`
- Create semantic tokens: `primary`, `primary-hover`, `primary-focus`, `primary-border`, `primary-text`
- Define neutral palette: `background`, `surface`, `border`, `text`, `text-muted`
- Export reusable utility classes for buttons, inputs, and cards

### AuthPage Updates
- Replace all `indigo-*` references with `rose-*` equivalents
- Change background from `bg-gray-50` to `bg-stone-50`
- Update heading from `text-3xl font-extrabold` to `text-2xl font-bold`
- Update button height from `py-2` to `py-2.5`

## Success Criteria
- Centralized styleguide exists in `frontend/src/index.css`
- AuthPage uses styleguide tokens (not hardcoded colors)
- All indigo references replaced with rose equivalents
- Background changed from gray-50 to stone-50
- No functional changes to form behavior
- No new dependencies or components

## Linear Ticket
[STU-8](https://linear.app/stuartcalverley/issue/STU-8)
