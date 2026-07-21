# STU-12: Add Database Seed Data

## Problem

The database starts empty in every new environment. Developers must manually create test users, companies, vendors, venues, bookings, and inquiries before doing any meaningful work or testing UI features.

## Desired Outcome

A seed data script that populates the database with realistic wedding industry sample data. After running the script, the database should contain enough data to:

- Log in as different user roles (vendor owner, venue owner, client)
- View populated dashboards with bookings and inquiries
- Test features without manual data entry each time

## Scope

**In scope:**
- Seed data for: `users`, `company`, `vendor`, `venue`, `bookings`, `inquiries`
- SQL seed file with INSERT statements
- npm script to run the seed against local D1

**Out of scope:**
- `user_type` and `user_user_type` tables (not used for this ticket)
- Production seeding
- Data factories or dynamic generation tools

## Linear Ticket

[STU-12](https://linear.app/stuart-calverley/issue/STU-12/add-database-seed-data-for-developmenttesting)
