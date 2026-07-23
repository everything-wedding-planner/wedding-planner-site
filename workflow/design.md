# STU-15: Company Page — Design Spec

## Page Layout

Single column, max-width constrained by the DashboardLayout shell. Sections stacked vertically with `space-y-6` gap.

```
┌─────────────────────────────────────────────┐
│  Page Header                                │
│  "Company" title                            │
├─────────────────────────────────────────────┤
│  Company Info Card                          │
│  ┌─────────────────────────────────────┐    │
│  │  Company Name          [Edit] btn   │    │
│  │  email · phone · address            │    │
│  │  (or editable form when toggled)    │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Summary Stats Row (2 cards)                │
│  ┌──────────────┐  ┌──────────────┐         │
│  │ 3 Vendors    │  │ 2 Venues     │         │
│  └──────────────┘  └──────────────┘         │
├─────────────────────────────────────────────┤
│  Vendors Card                               │
│  ┌─────────────────────────────────────┐    │
│  │  DataTable: name, service, contact  │    │
│  └─────────────────────────────────────┘    │
├─────────────────────────────────────────────┤
│  Venues Card                                │
│  ┌─────────────────────────────────────┐    │
│  │  DataTable: name, address, cap,     │    │
│  │            contact                  │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Section Details

### 1. Page Header

- `<h1>` with "Company" — `text-xl sm:text-2xl font-bold text-stone-900`
- Matches `DashboardHome` header pattern

### 2. Company Info Card

Uses existing `Card` component.

**View mode (default):**
- Company name as `<h2>` — `text-lg font-semibold text-stone-900`
- Detail rows as `<dl>` with label/value pairs:
  - Email, Phone, Address
  - Each row: `flex justify-between`, label `text-sm text-stone-500`, value `text-sm text-stone-900`
- Top-right: "Edit" button — `text-sm font-medium text-rose-600 hover:text-rose-700`

**Edit mode:**
- Same `Card` but fields become `<input>` elements
- Input style matches `OnboardingPage` pattern: `w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500`
- Fields: name, email, phone, address (all text inputs, email uses `type="email"`, phone uses `type="tel"`)
- Button row at bottom:
  - "Save" — `bg-rose-600 text-white` (primary), disabled while saving
  - "Cancel" — `text-stone-600 border border-stone-200` (secondary)
- On save: `PUT /api/companies/:id` with `{ name, email, phone, address }`, then refresh dashboard context

### 3. Summary Stats Row

Two `StatsCard` instances in a `grid grid-cols-2 gap-4`:
- "Vendors" — count from `vendors.length`, icon: `Package` from lucide-react
- "Venues" — count from `venues.length`, icon: `Building2` from lucide-react
- No trend indicator (omit `trend` prop)

### 4. Vendors Table

Uses existing `Card` (title: "Vendors") + `DataTable`.

Columns:
| Key | Header | Render |
|---|---|---|
| `name` | Name | `font-medium` text |
| `service_type` | Service | Plain text |
| `contact_name` | Contact | Plain text |
| `contact_email` | Email | Plain text |
| `contact_phone` | Phone | Plain text |

Empty state: "No vendors associated with this company."

### 5. Venues Table

Uses existing `Card` (title: "Venues") + `DataTable`.

Columns:
| Key | Header | Render |
|---|---|---|
| `name` | Name | `font-medium` text |
| `address` | Address | Plain text |
| `capacity` | Capacity | Plain text |
| `contact_name` | Contact | Plain text |
| `contact_email` | Email | Plain text |
| `contact_phone` | Phone | Plain text |

Empty state: "No venues associated with this company."

## Responsive Behavior

- All sections stack vertically on mobile (single column)
- `DataTable` handles responsive rendering automatically (desktop table → mobile cards)
- Stats row: `grid-cols-2` on all breakpoints (only 2 items)
- Company info: stacks label/value on mobile via existing `Card` padding

## Data Flow

1. `DashboardDataProvider` fetches `/api/dashboard` → provides `company`, `vendors`, `venues`
2. `CompanyPage` consumes via `useDashboardData()`
3. Edit mode maintains local state (`editForm`) cloned from `company`
4. Save sends `PUT /api/companies/:id` then re-fetches dashboard data to refresh context
5. After save, toggle back to view mode

## Icons (lucide-react)

- `Package` — vendor stats
- `Building2` — venue stats
- `Pencil` — edit button
- `Check` — save button (optional, or just text)
- `X` — cancel button (optional, or just text)

## Existing Components Used

- `Card` — `frontend/src/components/Card.tsx`
- `DataTable` — `frontend/src/components/DataTable.tsx`
- `StatsCard` — `frontend/src/components/StatsCard.tsx`
- `useDashboardData` — `frontend/src/components/DashboardDataProvider.tsx`

## Files to Create/Modify

| File | Action |
|---|---|
| `frontend/src/views/CompanyPage.tsx` | **Create** |
| `frontend/src/Router.tsx` | **Modify** — add route |
