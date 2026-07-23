# STU-17: Inquiry & Booking Filters — Proposal

## Problem

The dashboard inquiry and booking tables display all data with no way to narrow results. As data grows, users cannot quickly find specific items by date, status, or service type.

## Proposed Solution

Add a reusable `FilterBar` component that renders three `<select>` dropdowns (Date, Status, Service). Each table card on the dashboard gets its own independent filter bar. Filtering is applied client-side via `Array.filter()` before passing data to `DataTable`.

### Component: `FilterBar`

A new shared component at `frontend/src/components/FilterBar.tsx` that:

- Accepts `dateFilter`, `statusFilter`, `serviceFilter` state values + their setters as props
- Accepts a `statusOptions` array to support different status lists per table (inquiries vs bookings)
- Renders three `<select>` elements in a horizontal row (wrapping on mobile)
- Styled to match existing form input patterns (gray-200 border, rose-500 focus ring)
- Placed inside each `Card` between the title and the `DataTable`

### Changes to `DashboardHome.tsx`

- Add six new `useState` hooks: three filter states per table (`inquiryDateFilter`, `inquiryStatusFilter`, `inquiryServiceFilter`, `bookingDateFilter`, `bookingStatusFilter`, `bookingServiceFilter`)
- Derive filtered data using `useMemo` with filter logic:
  - **Date**: Compare `event_date` against today using relative ranges (start of today, start of week, start of month, start of year)
  - **Status**: Exact match against `item.status`
  - **Service**: Exact match against `item.service_type`
- Pass filtered arrays to `DataTable` instead of raw data

### Filter Options

| Filter | Values |
|--------|--------|
| Date | All Time, Today, This Week, This Month, This Year |
| Status (Inquiries) | All, New, Accepted, Rejected, Cancelled |
| Status (Bookings) | All, Pending, Accepted, Rejected, Cancelled |
| Service | All, Vendor, Venue |

### Files to Change

| File | Action |
|------|--------|
| `frontend/src/components/FilterBar.tsx` | **Create** — new shared component |
| `frontend/src/views/DashboardHome.tsx` | **Modify** — add filter state, filtering logic, render FilterBar |

## Key Decisions

1. **Separate FilterBar instances** — each table manages its own filter state independently. Changing a filter on inquiries does not affect bookings.
2. **Client-side filtering** — no backend changes. Data is fetched once, filtered in-memory.
3. **`useMemo` for derived data** — filtered arrays are memoized to avoid unnecessary re-renders of `DataTable`.
4. **Native `<select>` elements** — no external UI library. Matches existing form patterns in AuthPage and OnboardingPage.
5. **Reusable FilterBar** — accepts status options as a prop so it can be reused with different status lists.

## Success Criteria

- Each table card has its own Date / Status / Service dropdown
- Selecting a filter immediately updates the visible rows in that table only
- Filters default to "All" on page load
- Responsive: dropdowns stack on mobile, horizontal on desktop
- No regressions to existing table behavior
