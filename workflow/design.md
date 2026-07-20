# STU-11: Dashboard data & features — Design Spec

## Overview

Card-based dashboard layout with a stats row at the top, followed by two columns of tables and a quick actions grid. All components use the existing rose/stone design system.

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Welcome back, {username}!                          │
│  {company name}                                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Views    │ │Inquiries │ │ Bookings │ │Conver- │ │
│  │ 1,247    │ │ 23       │ │ 8        │ │sion 2% │ │
│  │ ↑ 12%    │ │ ↑ 5      │ │ ↓ 2      │ │        │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├────────────────────────────────┬────────────────────┤
│  Recent Inquiries              │ Upcoming Bookings  │
│  ┌──────────────────────────┐  │ ┌────────────────┐ │
│  │ Name | Date | Status     │  │ │ Date | Client  │ │
│  │ ...  | ...  | ...        │  │ │ ...  | ...     │ │
│  └──────────────────────────┘  │ └────────────────┘ │
├────────────────────────────────┴────────────────────┤
│  Quick Actions                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ Edit     │ │ Respond  │ │ View     │ │Manage  │ │
│  │ Listings │ │ to Inq.  │ │Analytics │ │Calendar│ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
```

## Component Specs

### StatsCard

Renders a single KPI metric.

```
┌─────────────────────┐
│ Total Views         │  ← text-sm text-stone-500
│ 1,247               │  ← text-2xl font-bold text-stone-900
│ ↑ 12% from last week│  ← text-xs text-green-600 (or red-600 for negative)
└─────────────────────┘
```

**Props:**
```typescript
interface StatsCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;      // percentage change
    label?: string;     // e.g., "from last week"
  };
  icon?: LucideIcon;
}
```

**Styling:**
- Container: `bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6`
- Label: `text-xs sm:text-sm font-medium text-stone-500`
- Value: `text-xl sm:text-2xl font-bold text-stone-900 mt-1`
- Trend positive: `text-xs font-medium text-green-600 mt-1`
- Trend negative: `text-xs font-medium text-red-600 mt-1`
- Icon (if provided): positioned top-right, `text-stone-400`, 24px

### Card

Generic container replacing repeated `bg-white rounded-xl shadow-md p-6` pattern.

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}
```

**Styling:**
- Container: `bg-white rounded-xl shadow-sm border border-stone-200`
- Padding: `p-4 sm:p-6` (default), overridable via className
- Title: `text-base sm:text-lg font-semibold text-stone-900 mb-4` (rendered inside if provided)

### Badge

Status indicator for inquiries and bookings.

**Props:**
```typescript
type BadgeVariant = 'new' | 'pending' | 'confirmed' | 'completed' | 'responded' | 'archived';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}
```

**Styling by variant:**
| Variant    | Background        | Text           |
|------------|-------------------|----------------|
| new        | `bg-blue-50`      | `text-blue-700`|
| pending    | `bg-yellow-50`    | `text-yellow-700`|
| confirmed  | `bg-green-50`     | `text-green-700`|
| completed  | `bg-stone-100`    | `text-stone-600`|
| responded  | `bg-purple-50`    | `text-purple-700`|
| archived   | `bg-stone-50`     | `text-stone-500`|

All: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`

### DataTable

Simple table for displaying lists of inquiries or bookings.

**Props:**
```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}
```

**Styling:**
- Container: inherits from parent Card
- Desktop (≥ 640px): standard table layout
  - Header row: `text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200`
  - Body rows: `text-sm text-stone-900 border-b border-stone-100 last:border-0`
  - Row hover: `hover:bg-stone-50`
  - Cell padding: `px-4 py-3`
- Mobile (< 640px): stacked card layout per row
  - Card: `bg-white border border-stone-100 rounded-lg p-4 mb-3`
  - Primary text (name): `text-sm font-medium text-stone-900`
  - Secondary text (service, date): `text-sm text-stone-500`
  - Badge: positioned at top-right of mobile card
  - Use `hidden sm:table-cell` on secondary columns, `sm:hidden` on mobile card view

### QuickActionCard

Clickable card for dashboard shortcuts.

**Props:**
```typescript
interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}
```

**Styling:**
- Container: `bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer`
- Icon: `text-rose-600` inside `bg-rose-50 rounded-lg p-2` wrapper
- Label: `text-sm font-semibold text-stone-900 mt-3`
- Description: `text-xs text-stone-500 mt-1 hidden sm:block` (hidden on mobile to save space)
- Wrapped in `<a>` or React Router `<Link>`

## Dashboard Page Layout

**DashboardHome.tsx structure:**
```tsx
<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
  {/* Header */}
  <div>
    <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Welcome back, {username}!</h1>
    <p className="text-xs sm:text-sm text-stone-500 mt-1">{companyName}</p>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatsCard ... />
    <StatsCard ... />
    <StatsCard ... />
    <StatsCard ... />
  </div>

  {/* Tables Row */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card title="Recent Inquiries">
      <DataTable columns={...} data={mockInquiries} />
    </Card>
    <Card title="Upcoming Bookings">
      <DataTable columns={...} data={mockBookings} />
    </Card>
  </div>

  {/* Quick Actions */}
  <Card title="Quick Actions">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <QuickActionCard ... />
      <QuickActionCard ... />
      <QuickActionCard ... />
      <QuickActionCard ... />
    </div>
  </Card>
</div>
```

## Mock Data Structure

File: `frontend/src/data/dashboardMockData.ts`

```typescript
export interface MockStats {
  totalViews: number;
  viewsTrend: number;
  totalInquiries: number;
  inquiriesTrend: number;
  totalBookings: number;
  bookingsTrend: number;
  conversionRate: number;
}

export interface MockInquiry {
  id: string;
  clientName: string;
  service: string;
  date: string;
  status: 'new' | 'responded' | 'archived';
}

export interface MockBooking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export const mockStats: MockStats = { ... };
export const mockInquiries: MockInquiry[] = [ ... ];
export const mockBookings: MockBooking[] = [ ... ];
export const quickActions = [ ... ];
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `frontend/src/components/StatsCard.tsx` | Create |
| `frontend/src/components/Card.tsx` | Create |
| `frontend/src/components/Badge.tsx` | Create |
| `frontend/src/components/DataTable.tsx` | Create |
| `frontend/src/components/QuickActionCard.tsx` | Create |
| `frontend/src/data/dashboardMockData.ts` | Create |
| `frontend/src/views/DashboardHome.tsx` | Rewrite |

## Mobile Responsiveness

All components must be fully responsive. Breakpoints follow Tailwind defaults:
- **Mobile** (< 640px): single column, stacked layout
- **Tablet** (640px–1024px): 2-column grids
- **Desktop** (> 1024px): full 4-column grids, side-by-side tables

### Stats Cards
- Mobile: full-width, single column (`grid-cols-1`)
- Tablet: 2 across (`sm:grid-cols-2`)
- Desktop: 4 across (`lg:grid-cols-4`)
- Value text scales down on mobile: `text-xl` on mobile, `text-2xl` on `sm:`+

### DataTable — Card Stack on Mobile
Tables switch to a stacked card layout on mobile instead of horizontal scroll.

**Mobile (< 640px):**
```
┌─────────────────────────────┐
│ Sarah Johnson               │  ← bold, primary text
│ Photography                 │  ← secondary text
│ Jul 15, 2026                │  ← muted text
│ ┌──────┐                    │
│ │ New  │                    │  ← badge
│ └──────┘                    │
└─────────────────────────────┘
```

**Desktop (≥ 640px):**
```
│ Sarah Johnson │ Photography │ Jul 15, 2026 │ New │
```

Implementation: On mobile, each row renders as a stacked card div. On `sm:`+, rows render as table-row elements. Use `hidden sm:table-cell` for secondary columns and `sm:hidden` for the mobile card view.

### Quick Actions
- Mobile: full-width, single column (`grid-cols-1`)
- Tablet: 2 across (`sm:grid-cols-2`)
- Desktop: 4 across (`lg:grid-cols-4`)

### Tables Row (Inquiries + Bookings side by side)
- Mobile: stacked vertically (`grid-cols-1`)
- Desktop: side by side (`lg:grid-cols-2`)

### General Mobile Rules
- All containers use responsive padding: `p-4 sm:p-6`
- Touch targets (buttons, cards) minimum 44x44px
- No horizontal scroll on any screen size
- Text truncation with `truncate` class for long names/descriptions on mobile

## Design Tokens Reference

All styling uses the existing rose/stone system from `index.css`:
- Primary: `rose-600` / `rose-500` / `rose-700`
- Background: `stone-50`
- Surfaces: `white`
- Borders: `stone-200`
- Text: `stone-900` (primary), `stone-500` (secondary), `stone-400` (muted)
