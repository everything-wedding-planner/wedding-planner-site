# STU-9: Dashboard Layout Proposal

## Problem

Once a user logs in, they land on a basic placeholder page (`App.tsx`) with no navigation or structure. There's no way to access features, and the layout doesn't scale as the app grows.

## Proposed Solution

Replace the current `App.tsx` with a dashboard shell that wraps all authenticated pages:

```
┌─────────────────────────────────────┐
│  Sidebar  │     Main Content        │
│           │                         │
│  Nav...   │   <Outlet />            │
│  Links    │   (child routes)        │
│           │                         │
└─────────────────────────────────────┘
```

### Key Components

1. **`DashboardLayout.tsx`** — New wrapper component with sidebar + main area
2. **`Sidebar.tsx`** — Navigation links (Guest List, Budget, Timeline, etc.)
3. **Nested routing** — Use React Router's `<Outlet />` for child routes

### Route Structure

```
/                  → DashboardLayout (wrapper)
  /dashboard       → DashboardHome (default view)
  /guests          → GuestList (future)
  /budget          → BudgetView (future)
  /timeline        → TimelineView (future)
```

## Key Changes

| File | Change |
|------|--------|
| `frontend/src/views/App.tsx` | Remove placeholder content, replace with `<Outlet />` or redirect |
| `frontend/src/components/DashboardLayout.tsx` | **New** — sidebar + main content wrapper |
| `frontend/src/components/Sidebar.tsx` | **New** — navigation links |
| `frontend/src/components/DashboardHome.tsx` | **New** — default landing view |
| `frontend/src/Router.tsx` | Add nested routes under dashboard |

## Scope

- Layout structure and navigation shell only
- No feature functionality (guests, budget, etc. are future tickets)
- Sidebar will have placeholder links that can be wired up later

## Design Decisions to Confirm

1. ~~**Sidebar width**: Fixed (e.g., 250px) or collapsible?~~ → Responsive: 256px desktop, 64px mobile
2. ~~**Sidebar style**: Full height, minimal icons or labels?~~ → Text + icons on desktop, icons only on mobile
3. ~~**Color scheme**: Extend the existing indigo/slate palette from AuthPage?~~ → Warmer rose/stone palette

## Success Criteria

- [ ] User sees dashboard layout after login
- [ ] Sidebar displays navigation links
- [ ] Main content area renders based on route
- [ ] Layout is responsive (sidebar collapses on mobile?)

## Linear Ticket

[STU-9](https://linear.app/stuart-calverley/issue/STU-9/design-logged-in-dashboard-layout)
