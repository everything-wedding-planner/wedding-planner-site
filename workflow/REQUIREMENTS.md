# STU-17: Add filter controls to inquiry and booking tables

## Problem

The dashboard inquiry and booking tables display all data with no way to narrow results. As data grows, users cannot quickly find specific items by date, status, or service type.

## Desired Outcome

Users can filter both the inquiry and booking tables by:

- **Date** — relative ranges (All Time, Today, This Week, This Month, This Year)
- **Status** — status-specific options per table:
  - Inquiries: All, New, Accepted, Rejected, Cancelled
  - Bookings: All, Pending, Accepted, Rejected, Cancelled
- **Service** — All, Vendor, Venue

Filters are applied client-side. Each table (Inquiries, Bookings) has its own independent set of filter controls. Filters default to "All" on page load.

## Scope

**In scope:**

- New `FilterBar` component with three `<select>` dropdowns (Date, Status, Service)
- Filter state management in `DashboardHome.tsx` (one set of state per table)
- Client-side filtering logic using `Array.filter()` before passing data to `DataTable`
- Responsive layout matching existing card/table patterns

**Out of scope:**

- Backend query parameter filtering
- URL query param sync (bookmarkable filter state)
- Clear/reset filter button
- Multi-select filters
- Filter count indicators

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-17/add-filter-controls-to-inquiry-and-booking-tables
