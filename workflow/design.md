# STU-12: Seed Data — Design Spec

## File Structure

```
database/
  seed.sql          # All seed data
  migrations/       # Existing migrations (unchanged)
```

## SQL Structure

Use `INSERT OR IGNORE` with explicit IDs to ensure idempotency and predictable foreign key references.

```sql
-- Disable foreign key checks for seeding
PRAGMA foreign_keys = OFF;

-- Seed data here

PRAGMA foreign_keys = ON;
```

## Sample Data

### Users

| ID | Username | Email | Role | Password |
|----|----------|-------|------|----------|
| 1 | vendor_owner1 | vendor1@example.com | vendor | password123 |
| 2 | vendor_owner2 | vendor2@example.com | vendor | password123 |
| 3 | venue_owner1 | venue1@example.com | venue | password123 |
| 4 | venue_owner2 | venue2@example.com | venue | password123 |
| 5 | client1 | client1@example.com | client | password123 |
| 6 | client2 | client2@example.com | client | password123 |

All users: `is_active = 1`, `completed_onboarding = 1`

### Companies

| ID | User ID | Name | Type |
|----|---------|------|------|
| 1 | 1 | Bloom Photography | vendor |
| 2 | 2 | Petal & Vine Florals | vendor |
| 3 | 3 | The Garden Estate | venue |
| 4 | 4 | Coastal Bliss Venue | venue |

### Vendors

| ID | Company ID | Name | Service Type |
|----|------------|------|--------------|
| 1 | 1 | Bloom Photography | photography |
| 2 | 2 | Petal & Vine Florals | florist |

### Venues

| ID | Company ID | Name | Capacity |
|----|------------|------|----------|
| 1 | 3 | The Garden Estate | 200 |
| 2 | 4 | Coastal Bliss Venue | 150 |

### Bookings

| ID | Client ID | Company ID | Service Type | Event Date | Status |
|----|-----------|------------|--------------|------------|--------|
| 1 | 5 | 1 | photography | 2026-09-15 | CONFIRMED |
| 2 | 5 | 3 | venue | 2026-09-15 | CONFIRMED |
| 3 | 6 | 2 | florist | 2026-10-20 | PENDING |
| 4 | 6 | 4 | venue | 2026-10-20 | PENDING |
| 5 | 5 | 1 | photography | 2025-12-01 | COMPLETED |

### Inquiries

| ID | Service Type | Client ID | Event Date | Status |
|----|--------------|-----------|------------|--------|
| 1 | photography | 5 | 2026-09-15 | CONVERTED |
| 2 | venue | 5 | 2026-09-15 | CONVERTED |
| 3 | florist | 6 | 2026-10-20 | RESPONDED |
| 4 | venue | 6 | 2026-10-20 | NEW |
| 5 | photography | 5 | 2027-03-01 | NEW |
| 6 | florist | 6 | 2027-06-15 | NEW |

## NPM Script

```json
"db:seed": "wrangler d1 execute wedding-planner --local --file=./database/seed.sql"
```

Uses `--local` to target the local D1 database (not production).

## Password Hash

All seed users share one bcrypt hash for `password123`:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

This is a pre-computed hash — no runtime bcrypt needed during seeding.
