# STU-11: Dashboard data & features — Proposal

## Problem

The dashboard currently shows only a greeting. Vendors/venues have no visibility into how their listings are performing — no views, inquiries, bookings, or engagement metrics are displayed.

## Proposed Solution

Build out the dashboard homepage with five data sections using mock/placeholder data, reusable UI components, and a clean card-based layout. No charts — focus on numeric KPI cards, lists, and quick-action shortcuts.

## Key Changes

### New Reusable Components (`frontend/src/components/`)
- `StatsCard.tsx` — KPI card showing a label, numeric value, and optional trend indicator
- `Card.tsx` — Generic card container (replaces repeated `bg-white rounded-xl shadow-md p-6`)
- `Badge.tsx` — Status badge (new, pending, confirmed, completed, etc.)
- `DataTable.tsx` — Simple list/table for inquiries and bookings

### Dashboard Sections (`frontend/src/views/DashboardHome.tsx`)
1. **Welcome header** — Greeting with company name
2. **Stats row** — 3–4 StatsCards: total views, total inquiries, total bookings, conversion rate
3. **Recent Inquiries** — Table of latest inquiries with status badges
4. **Upcoming Bookings** — Table of upcoming bookings with date, client, status
5. **Quick Actions** — Card grid with shortcuts (Edit listings, Respond to inquiries, View analytics, Manage calendar)

### Mock Data
- Centralized `frontend/src/data/dashboardMockData.ts` with sample stats, inquiries, and bookings
- Easy to swap out when backend endpoints are added later

## Success Criteria

- Dashboard displays meaningful data across all 5 sections
- Reusable components are extracted and used consistently
- All data comes from mock data file (no hardcoded strings in components)
- TypeScript strict mode passes (no unused imports/variables)
- Visual design matches existing rose/stone design system
