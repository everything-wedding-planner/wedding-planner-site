# STU-19: Vendor Management Page - Proposal

## Problem
Companies (vendors/venues) need a centralized page within the admin dashboard to manage their vendor listings, update vendor details, and see performance metrics (inquiries and bookings) for each vendor.

## Proposed Solution
Create a new admin dashboard page (`/vendors`) that provides:
1. **Vendor List View** — Table showing all vendors associated with the company
2. **Inline Editing** — Edit vendor details directly in the table
3. **Add Vendor Flow** — Form to create new vendor listings
4. **Performance Metrics** — Display inquiry and booking counts per vendor

## Key Changes
- New React component: `VendorManagementPage.tsx`
- Extend `vendorController.ts` with auth, PUT, and metrics endpoints
- Add `updateVendor` method to `vendorModel.ts`
- Add route to `Router.tsx`
- Add navigation link to `Sidebar.tsx`

## Success Criteria
- [ ] Company can view all their vendors in a table
- [ ] Company can edit vendor details and save changes
- [ ] Company can add new vendors
- [ ] Each vendor shows inquiry count and booking count
- [ ] Page integrates with existing dashboard layout and styling

## Technical Considerations
- Use existing React + Tailwind CSS v4 stack
- Follow existing patterns (Card, DataTable, StatsCard components)
- Reuse `DashboardDataProvider` for vendor data
- Implement proper form validation and error handling
- Follow venueController.ts pattern for auth and metrics

## Decisions
1. **Display:** Table view (matching venues)
2. **Editing:** Inline editing (matching CompanyPage)
3. **Required fields:** name, service_type, contact_name, email, phone
4. **Auth:** All endpoints require session authentication, scoped to user's company

## Next Steps
- Create detailed design spec
- Implement feature
