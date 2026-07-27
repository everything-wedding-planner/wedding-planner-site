# STU-20: Venue/Vendor Detail Pages with Inquiries, Bookings & Analytics

## Problem

Users can currently list and edit venues/vendors, but cannot click into a specific venue/vendor to see detailed information including inquiries, bookings, and basic analytics. This limits visibility into individual service performance.

## Desired Outcome

Clicking a venue/vendor row navigates to a dedicated detail page showing:
- Venue/vendor details (name, contact info, etc.)
- Basic analytics (inquiry count, booking count)
- List of inquiries with ability to update status (NEW, ACCEPTED, CANCELLED, REJECTED)
- List of bookings with calendar visualization showing booked dates

## Backend API (provided)

The following endpoints will be available:
- `GET /api/venues/:id` - Get venue details
- `GET /api/vendors/:id` - Get vendor details
- `GET /api/venues/:id/inquiries` - List inquiries for a venue
- `GET /api/vendors/:id/inquiries` - List inquiries for a vendor
- `GET /api/venues/:id/bookings` - List bookings for a venue
- `GET /api/vendors/:id/bookings` - List bookings for a vendor
- `PATCH /api/inquiries/:id/status` - Update inquiry status
- `PATCH /api/bookings/:id/status` - Update booking status

## Scope

**In scope:**
- New detail pages at `/venues/:id` and `/vendors/:id`
- Inquiries list with status update UI
- Bookings list with calendar view

**Out of scope:**
- Backend routes (user will implement)
- Detailed analytics (time-series, conversion rates)
- Public-facing pages
- Bulk status updates

## Linear Ticket

[STU-20 Venue/Vendor Detail Pages with Inquiries, Bookings & Analytics](https://linear.app/stuart-calverley/issue/STU-20/venuevendor-detail-pages-with-inquiries-bookings-and-analytics)
