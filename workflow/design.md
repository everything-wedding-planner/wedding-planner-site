# STU-17: Inquiry & Booking Filters — Design Spec

## FilterBar Component

### Layout

The filter bar sits inside each `Card`, below the title and above the `DataTable`. It uses a horizontal flex row that wraps on small screens.

```
[Recent Inquiries]
┌──────────────────────────────────────────────────────┐
│  [Date ▾]  [Status ▾]  [Service ▾]                  │
├──────────────────────────────────────────────────────┤
│  Client  |  Service Name  |  ...  |  Status          │
│  ────────┼────────────────┼───────┼───────────────── │
│  ...     |  ...           |  ...  |  [Badge]         │
└──────────────────────────────────────────────────────┘
```

### Container

```html
<div class="flex flex-wrap gap-3 mb-4">
  <!-- three <select> elements -->
</div>
```

- `flex flex-wrap` — horizontal on desktop, wraps on mobile
- `gap-3` — 12px spacing between dropdowns
- `mb-4` — 16px bottom margin before the DataTable (matches Card's existing `mb-4` on title)

### Select Element Styling

Uses the same input class pattern found in `AuthPage.tsx` and `OnboardingPage.tsx`:

```
px-3 py-2 border border-gray-200 text-sm text-gray-900 rounded-md
focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500
bg-white
```

Additional:
- `min-w-[140px]` — prevents selects from collapsing too narrow
- `cursor-pointer`

### Labels

No visible labels — the dropdown's first option ("All Dates", "All Statuses", "All Services") serves as the label. This keeps the filter bar compact.

### Options Structure

Each `<select>` has a disabled + selected default "All" option at the top:

**Date filter:**
```html
<option value="all" disabled>All Dates</option>
<option value="all">All Dates</option>
<option value="today">Today</option>
<option value="week">This Week</option>
<option value="month">This Month</option>
<option value="year">This Year</option>
```

**Status filter (Inquiries):**
```html
<option value="all" disabled>All Statuses</option>
<option value="all">All Statuses</option>
<option value="NEW">New</option>
<option value="ACCEPTED">Accepted</option>
<option value="REJECTED">Rejected</option>
<option value="CANCELLED">Cancelled</option>
```

**Status filter (Bookings):**
```html
<option value="all" disabled>All Statuses</option>
<option value="all">All Statuses</option>
<option value="PENDING">Pending</option>
<option value="ACCEPTED">Accepted</option>
<option value="REJECTED">Rejected</option>
<option value="CANCELLED">Cancelled</option>
```

**Service filter:**
```html
<option value="all" disabled>All Services</option>
<option value="all">All Services</option>
<option value="VENDOR">Vendor</option>
<option value="VENUE">Venue</option>
```

### Props Interface

```typescript
interface FilterBarProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
}
```

### Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| `< sm` (mobile) | Dropdowns stack vertically, full width |
| `≥ sm` (desktop) | Horizontal row, auto-sized |

Mobile stacking via:
```
flex flex-col sm:flex-row gap-3
```

Each select on mobile: `w-full sm:w-auto`

## Filtering Logic (DashboardHome.tsx)

### Date Filtering

Uses `event_date` from the DTO. Compares against `new Date()`:

- **Today**: `event_date >= startOfToday`
- **This Week**: `event_date >= startOfWeek` (Monday)
- **This Month**: `event_date >= startOfMonth` (1st of month)
- **This Year**: `event_date >= startOfYear` (Jan 1)

Helper function (inline, not exported):

```typescript
function getDateRange(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week": {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(now.getFullYear(), now.getMonth(), diff);
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
}
```

### Derived Data

Use `useMemo` to compute filtered arrays:

```typescript
const filteredInquiries = useMemo(() => {
  return inquiries.filter((item) => {
    // Date filter
    if (inquiryDateFilter !== "all") {
      const range = getDateRange(inquiryDateFilter);
      if (range && new Date(item.event_date) < range) return false;
    }
    // Status filter
    if (inquiryStatusFilter !== "all" && item.status !== inquiryStatusFilter) return false;
    // Service filter
    if (inquiryServiceFilter !== "all" && item.service_type !== inquiryServiceFilter) return false;
    return true;
  });
}, [inquiries, inquiryDateFilter, inquiryStatusFilter, inquiryServiceFilter]);
```

Same pattern for `filteredBookings`.

## Color & Typography

All colors and typography match the existing design system:

| Element | Style |
|---------|-------|
| Select text | `text-sm text-gray-900` |
| Select border | `border border-gray-200` |
| Select focus ring | `focus:ring-2 focus:ring-offset-2 focus:ring-rose-500` |
| Select background | `bg-white` |
| Select border radius | `rounded-md` |
| Container gap | `gap-3` (12px) |
| Container margin bottom | `mb-4` (16px) |

No new design tokens, colors, or typography introduced.
