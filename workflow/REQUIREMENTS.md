# STU-14: Conditional Sidebar Navigation Based on User Data

## Problem

The sidebar currently has hardcoded `shouldShow` booleans for navigation items. Company, Vendors, and Venues tabs are always hidden (`shouldShow: false`), while Dashboard and Onboarding are always shown. There is no dynamic behavior based on whether the user actually has data for these sections.

## Desired Outcome

Sidebar navigation items should be conditionally visible based on whether the user has relevant data:

- **Company tab**: Show if user has a company profile (non-null company data)
- **Vendors tab**: Show if user has vendor data (non-null vendor data)
- **Venues tab**: Show if user has venue data (non-null venue data)
- **Dashboard**: Always visible
- **Onboarding**: Always visible

This applies to both desktop and mobile sidebars (they share the same logic).

## Assumptions

- The API will return non-null values when the user has set up said entity
- No new API endpoints need to be created for this ticket — we assume the data is available

## Scope

- Modify `Sidebar.tsx` to accept dynamic `shouldShow` values via props or context
- Update `DashboardLayout.tsx` to pass the appropriate data to the sidebar
- Both desktop and mobile sidebars should behave identically

## Out of Scope

- Creating new API endpoints to fetch company/vendor/venue status
- Styling changes to the sidebar
- Adding/removing navigation items

## Linear Ticket

[STU-14](https://linear.app/stuart-calverley/issue/STU-14/conditional-sidebar-navigation-based-on-user-data)
