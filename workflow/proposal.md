# STU-15: Company Page — Proposal

## Problem

The sidebar has a "Company" nav item linking to `/company`, but no route or page exists. Users cannot view or edit their company profile, nor see associated vendors/venues from a dedicated page.

## Proposed Solution

Create a single `CompanyPage.tsx` view with three sections:

1. **Company Info** — Read-only display of company details (name, email, phone, address) with a toggle to switch into an editable form. Save/Cancel on edit.
2. **Vendor Summary** — Count badge + `DataTable` listing vendors with name, service type, and contact details.
3. **Venue Summary** — Count badge + `DataTable` listing venues with name, address, capacity, and contact details.

Data comes from `useDashboardData()` (already fetched by `DashboardDataProvider`). Edit saves via `PUT /api/companies/:id` and refreshes the context.

## Key Changes

| File | Change |
|---|---|
| `frontend/src/views/CompanyPage.tsx` | New view component |
| `frontend/src/Router.tsx` | Add `/company` route inside DashboardLayout |

## Success Criteria

- `/company` route renders the page with real data from the dashboard context
- Company info displays correctly and can be edited and saved
- Vendor and venue tables list all associated records
- Page is responsive (mobile card layout via DataTable)
- No regressions to existing pages

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-15/company-page-view-and-update-company-information
