# STU-15: Company Page — View and Update Company Information

## Problem

The sidebar has a "Company" nav item that links to `/company`, but no route or page component exists. Users have no way to view or edit their company profile, and no way to see the vendors and venues associated with their company from a dedicated page.

## Desired Outcome

A company page where users can:

- View their company profile (name, email, phone, address)
- Edit and save company information
- See a list of vendors associated with their company (name, service type, contact details)
- See a list of venues associated with their company (name, address, capacity, contact details)

## Scope

### In scope

- Frontend: Create a `CompanyPage.tsx` view with company info (editable) and vendor/venue tables
- Frontend: Add `/company` route to the router

### Out of scope

- Backend endpoints (assumed to exist and return expected data)
- Individual vendor or venue detail/edit pages
- Analytics dashboard
- Recent activity feed

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-15/company-page-view-and-update-company-information
