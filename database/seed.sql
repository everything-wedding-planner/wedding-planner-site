-- Seed data for development/testing (STU-12)
-- Run with: npm run db:seed
-- Uses INSERT OR IGNORE with explicit IDs for idempotency.

PRAGMA foreign_keys = OFF;

-- ============================================================
-- USERS
-- ============================================================
-- All users share password: password123
-- Bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT OR IGNORE INTO users (id, username, email, password_hash, is_active, completed_onboarding)
VALUES
    (1, 'vendor_owner1', 'vendor1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1),
    (2, 'vendor_owner2', 'vendor2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1),
    (3, 'venue_owner1', 'venue1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1),
    (4, 'venue_owner2', 'venue2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1),
    (5, 'client1', 'client1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1),
    (6, 'client2', 'client2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 1, 1);

-- ============================================================
-- COMPANIES
-- ============================================================

INSERT OR IGNORE INTO company (id, user_id, name, address, phone, email)
VALUES
    (1, 1, 'Bloom Photography', '123 Main St, Springfield', '555-0101', 'info@bloomphoto.com'),
    (2, 2, 'Petal & Vine Florals', '456 Oak Ave, Portland', '555-0102', 'hello@petalvine.com'),
    (3, 3, 'The Garden Estate', '789 Garden Rd, Napa', '555-0103', 'events@gardenestate.com'),
    (4, 4, 'Coastal Bliss Venue', '321 Beach Blvd, Malibu', '555-0104', 'info@coastalbliss.com');

-- ============================================================
-- VENDORS
-- ============================================================

INSERT OR IGNORE INTO vendor (id, company_id, name, service_type, contact_name, contact_email, contact_phone)
VALUES
    (1, 1, 'Bloom Photography', 'photography', 'Alex Bloom', 'alex@bloomphoto.com', '555-0101'),
    (2, 2, 'Petal & Vine Florals', 'florist', 'Morgan Vine', 'morgan@petalvine.com', '555-0102');

-- ============================================================
-- VENUES
-- ============================================================

INSERT OR IGNORE INTO venue (id, company_id, name, address, capacity, contact_name, contact_email, contact_phone)
VALUES
    (1, 3, 'The Garden Estate', '789 Garden Rd, Napa', 200, 'Jordan Estate', 'jordan@gardenestate.com', '555-0103'),
    (2, 4, 'Coastal Bliss Venue', '321 Beach Blvd, Malibu', 150, 'Casey Bliss', 'casey@coastalbliss.com', '555-0104');

-- ============================================================
-- BOOKINGS
-- ============================================================
-- Note: The bookings table FK references clients(id) which doesn't exist
-- as a standalone table. We create a minimal clients table to satisfy the
-- FK constraint. Data is populated from users where role = 'client'.

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY,
    name TEXT
);

INSERT OR IGNORE INTO clients (id, name)
SELECT id, username FROM users WHERE id IN (5, 6);

-- service_id references vendor.id or venue.id depending on service_type

INSERT OR IGNORE INTO bookings (id, client_id, company_id, service_type, service_id, event_date, status)
VALUES
    (1, 5, 1, 'photography', 1, '2026-09-15', 'CONFIRMED'),
    (2, 5, 3, 'venue', 1, '2026-09-15', 'CONFIRMED'),
    (3, 6, 2, 'florist', 2, '2026-10-20', 'PENDING'),
    (4, 6, 4, 'venue', 2, '2026-10-20', 'PENDING'),
    (5, 5, 1, 'photography', 1, '2025-12-01', 'COMPLETED');

-- ============================================================
-- INQUIRIES
-- ============================================================
-- service_id references vendor.id or venue.id depending on service_type

INSERT OR IGNORE INTO inquiries (id, service_id, service_type, client_id, event_date, status)
VALUES
    (1, 1, 'photography', 5, '2026-09-15', 'CONVERTED'),
    (2, 1, 'venue', 5, '2026-09-15', 'CONVERTED'),
    (3, 2, 'florist', 6, '2026-10-20', 'RESPONDED'),
    (4, 2, 'venue', 6, '2026-10-20', 'NEW'),
    (5, 1, 'photography', 5, '2027-03-01', 'NEW'),
    (6, 2, 'florist', 6, '2027-06-15', 'NEW');

PRAGMA foreign_keys = ON;
