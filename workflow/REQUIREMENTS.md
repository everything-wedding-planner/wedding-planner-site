# STU-11: Dashboard data & analytics features

## Problem

The dashboard (STU-9) provides a logged-in shell but currently shows no meaningful data. Vendors/venues have no visibility into how their listings are performing — no views, inquiries, bookings, or engagement metrics exist in the system.

## Desired Outcome

A fully functional dashboard that gives vendors/venues at-a-glance visibility into their business performance, including:

### 1. Profile Views / Impressions
- Track how many times a vendor or venue listing was viewed
- Show total views and trend over time (e.g., this week vs last week)
- Breakdown by listing (if user has multiple vendors/venues)

### 2. Inquiries / Interest
- List of inquiries or expressions of interest received
- Status tracking (new, responded, archived)
- Contact details of the interested party

### 3. Bookings / Booked Dates
- Upcoming bookings with date, client, and details
- Past bookings history
- Booking status (confirmed, pending, completed)

### 4. Performance Metrics
- Aggregate stats: total views, total inquiries, conversion rate
- Reviews/ratings if applicable
- Ranking or position in search results

### 5. Quick Actions
- Shortcuts to manage listings (edit vendor/venue details)
- Respond to inquiries
- View full analytics page
- Manage availability/calendar

## Scope

### In scope
- Frontend dashboard components displaying the above data
- Integration with existing vendor/venue data (mock or placeholder data for now)

### Out of scope
- New database tables for analytics, inquiries, and bookings
- Backend API endpoints to serve dashboard data
- End-user (couple) facing features
- Payment processing
- Messaging/communication system (beyond listing inquiries)
- Advanced reporting or export

## Current State

- `DashboardHome.tsx` fetches company/vendor/venue data but only renders a greeting
- `dashboardController.ts` returns basic entity data (company, vendors, venues)
- No analytics, inquiries, or bookings tables exist
- Sidebar has placeholder nav items (Company, Vendors, Venues) that are hidden

## Linear Ticket

[STU-11](https://linear.app/stuart-calverley/issue/STU-11/dashboard-data-and-analytics-features)
