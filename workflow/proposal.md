# STU-12: Seed Data — Proposal

## Problem

The database starts empty in every new environment. Developers must manually create test users, companies, vendors, venues, bookings, and inquiries before doing any meaningful work or testing UI features.

## Proposed Solution

Create a SQL seed file with INSERT statements and an npm script to run it against the local D1 database via `wrangler d1 execute`.

- **`database/seed.sql`** — Contains all seed data with `INSERT OR IGNORE` for idempotency
- **`npm run db:seed`** — Executes the seed file against local D1

## Key Changes

| File | Change |
|------|--------|
| `database/seed.sql` | New — all seed data |
| `package.json` | Add `"db:seed"` script |

## Seed Data Overview

| Table | Records | Notes |
|-------|---------|-------|
| `users` | 6 | 2 vendor owners, 2 venue owners, 2 clients |
| `company` | 4 | 2 vendor companies, 2 venue companies |
| `vendor` | 2 | photographer, florist |
| `venue` | 2 | garden estate, beach venue |
| `bookings` | 4-6 | Mixed statuses across past/future dates |
| `inquiries` | 6-8 | Mixed statuses |

All users share password `password123` (bcrypt hash).

## Success Criteria

- `npm run db:seed` populates the database without errors
- Can log in as any seeded user
- Dashboards display populated bookings and inquiries
- Running the script multiple times doesn't create duplicates
