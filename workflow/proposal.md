# STU-20 Proposal: Venue/Vendor Detail Pages

## Problem

The venue and vendor management pages currently show only a table/card list with basic metrics. There is no way to click into a specific venue or vendor to see detailed information, their inquiries, bookings, or a calendar view. Users cannot manage inquiry statuses or see booking dates, limiting operational visibility.

## Proposed Solution

Add dedicated detail pages at `/venues/:id` and `/vendors/:id` that are accessible by clicking a venue/vendor row in the management tables. Each detail page will display:

1. **Header** — Venue/vendor name, contact info, and "Back to Venues/Vendors" link
2. **Stats summary** — Inquiry count and booking count (reusing `StatsCard`)
3. **Inquiries section** — Table of inquiries with status badges, inline status update via dropdown (NEW → ACCEPTED/CANCELLED/REJECTED), and expandable row showing client ID, service type, timestamps
4. **Bookings section** — Table of bookings with status badges, expandable row detail, plus `react-big-calendar` visualization showing booked dates

## Key Changes

| Area | Change |
|------|--------|
| `Router.tsx` | Add `/venues/:id` and `/vendors/:id` routes under the `DashboardLayout` children |
| `VenueDetailPage.tsx` | New view — fetches venue details, inquiries, bookings; renders stats, inquiry table, booking table + calendar |
| `VendorDetailPage.tsx` | Same as above for vendors |
| `VenueManagementPage.tsx` | Make venue name rows clickable → `navigate(/venues/:id)` |
| `VendorManagementPage.tsx` | Make vendor name rows clickable → `navigate(/vendors/:id)` |
| `BookingCalendar.tsx` | New component — wraps `react-big-calendar` to show bookings on a calendar |
| `StatusSelect.tsx` | New component — dropdown for changing inquiry/booking status inline |
| `Badge.tsx` | Edit — accept string variant, remove backend model import |
| `types.ts` | New — shared frontend Inquiry/Booking types |

## Success Criteria

- Clicking a venue/vendor name navigates to its detail page
- Detail page shows venue/vendor info, inquiry count, booking count
- "Back to Venues/Vendors" link returns to the list page
- Inquiries are listed with status badges, can be updated inline, and expand to show client detail
- Bookings are listed with status badges, expand to show detail, and appear on a `react-big-calendar` calendar
- All existing functionality (list, add, edit) remains unchanged
- Responsive design works on mobile and desktop
