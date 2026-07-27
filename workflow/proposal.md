# STU-18: Venue Management Page - Proposal

## Problem
Companies (vendors/venues) need a centralized page within the admin dashboard to manage their venue listings, update venue details, and see performance metrics (inquiries and bookings) for each venue.

## Proposed Solution
Create a new admin dashboard page (`/venues`) that provides:
1. **Venue List View** — Table/card grid showing all venues associated with the company
2. **Venue Detail View** — Ability to view and edit venue details (name, location, description, photos, pricing, availability)
3. **Add Venue Flow** — Form/modal to create new venue listings
4. **Performance Metrics** — Display inquiry and booking counts per venue

## Key Changes
- New React component: `VenueManagementPage.tsx`
- New API endpoints for venue CRUD operations (if not existing)
- Extend `DashboardDataProvider` to include venue-specific data (inquiry/booking counts)
- Add route to `Router.tsx`
- Add navigation link to `Sidebar.tsx`

## Success Criteria
- [ ] Company can view all their venues in a list/grid
- [ ] Company can edit venue details and save changes
- [ ] Company can add new venues
- [ ] Each venue shows inquiry count and booking count
- [ ] Page integrates with existing dashboard layout and styling

## Technical Considerations
- Use existing React + Tailwind CSS v4 stack
- Follow existing patterns (Card, DataTable, StatsCard components)
- Extend `DashboardDataProvider` for venue metrics
- Implement proper form validation and error handling

## Decisions
1. **Display:** Table view (like vendors)
2. **Editing:** Inline editing (like CompanyPage)
3. **Photo uploads:** Support both URL input and file upload
4. **Required fields:** All existing fields required (name, address, capacity, contact_name, email, phone)

## Next Steps
- Create detailed design spec
- Implement feature