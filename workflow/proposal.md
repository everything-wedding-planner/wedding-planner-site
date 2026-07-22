# STU-14: Proposal — Conditional Sidebar Navigation

## Problem

The sidebar has hardcoded `shouldShow: false` for Company, Vendors, and Venues tabs. There's no mechanism to dynamically show/hide these based on whether the user has set up the corresponding data.

## Current State

- `Sidebar.tsx` defines `navItems` as a static array with boolean `shouldShow`
- Both `Sidebar` and `MobileSidebar` filter on `shouldShow` before rendering
- `DashboardLayout.tsx` renders both sidebars with no data props
- The app already uses React Context for auth (`AuthProvider.tsx`)

## Proposed Solution

### Option A: Extend AuthContext (Simplest)

Add `company`, `vendors`, `venues` fields to the existing `AuthContextType`. The `/api/me` endpoint would return this data alongside the user.

**Pros:** No new providers, minimal boilerplate
**Cons:** Auth context becomes overloaded; couples sidebar data to auth

### Option B: New DashboardDataProvider (Recommended)

Create a `DashboardDataProvider` context that:
1. Fetches company, vendor, and venue objects from the API
2. Provides the raw objects (nullable) to children
3. Wraps the `DashboardLayout` route

Consumers compute visibility: `shouldShow: company !== null`

**Pros:** Separation of concerns; reusable for other dashboard features; flexible — consumers decide how to use the data
**Cons:** One additional provider

### Option C: Props Drilling

Pass data from a parent component down through `DashboardLayout` → `Sidebar`.

**Pros:** No context needed
**Cons:** Tight coupling; harder to maintain as dashboard grows

## Recommendation

**Option B** — A dedicated `DashboardDataProvider` keeps the sidebar data separate from auth, is extensible for future dashboard features, and follows the existing pattern established by `AuthProvider`.

## Key Changes

| File | Change |
|------|--------|
| `DashboardDataProvider.tsx` (new) | Context + fetch logic for company/vendor/venue status |
| `Sidebar.tsx` | Accept `navItems` as prop (or consume context) instead of static array |
| `DashboardLayout.tsx` | Wrap with `DashboardDataProvider`, pass data to sidebars |
| `Router.tsx` | No changes needed — provider wraps at layout level |

## Success Criteria

- Company tab visible when user has company data
- Vendors tab visible when user has vendor data
- Venues tab visible when user has venue data
- Dashboard and Onboarding always visible
- Both desktop and mobile sidebars behave identically
- No regressions in existing navigation behavior
