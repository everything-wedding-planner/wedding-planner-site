# STU-20 Design Spec: Venue/Vendor Detail Pages

## Routes

```
/venues/:id    → VenueDetailPage
/vendors/:id   → VendorDetailPage
```

Both nested under `DashboardLayout` (sidebar + mobile nav visible).

## Page Layout

### Back Navigation
- Top of page: `< ArrowLeft` icon + "Back to Venues" / "Back to Vendors" link
- Uses `useNavigate(-1)` or links to `/venues` / `/vendors`

### Header Section
- Venue/vendor name as `<h1>` (text-2xl font-bold text-stone-900)
- Contact info row: email, phone, address (for venues) or service_type (for vendors)
- Styled as a `Card` component

### Stats Row
- Two `StatsCard` components side by side:
  - **Inquiries** — count value, `MessageSquare` icon
  - **Bookings** — count value, `Calendar` icon
- On mobile: stack vertically (grid grid-cols-2 gap-4)

### Inquiries Section (`Card`)
- Section title: "Inquiries"
- `DataTable` with columns:
  - **Event Date** — formatted locale date
  - **Status** — `Badge` component (NEW=blue, ACCEPTED=green, REJECTED=purple, CANCELLED=stone)
  - **Actions** — `StatusSelect` dropdown (only shown for non-terminal statuses)
- Clicking a row expands it to show additional detail:
  - Client ID, Service Type, Created At, Updated At
- Status update flow:
  1. User selects new status from dropdown
  2. `PATCH /api/inquiries/:id/status` with `{ status: "ACCEPTED" }`
  3. Optimistic update: immediately update local state
  4. Re-fetch on error to roll back

### Inquiry Detail (expandable row or click-to-expand)
- Clicking an inquiry row expands to show additional detail:
  - **Client ID** — displayed as-is
  - **Service Type** — VENUE or VENDOR
  - **Created At** — formatted locale datetime
  - **Updated At** — formatted locale datetime
- Implemented as an expandable row in the DataTable (click toggles detail panel below the row)

### Bookings Section (`Card`)
- Section title: "Bookings"
- `DataTable` with columns:
  - **Event Date** — formatted locale date
  - **Status** — `Badge` component (PENDING=yellow, ACCEPTED=green, REJECTED=purple, CANCELLED=stone)
  - **Actions** — `StatusSelect` dropdown (only shown for non-terminal statuses)
- Status update flow: same as inquiries, uses `PATCH /api/bookings/:id/status`
- Same expandable row behavior as inquiries for additional detail

### Calendar Visualization (`react-big-calendar`)
- Uses `react-big-calendar` with `moment` adapter for the calendar display
- Displays bookings as calendar events spanning their event_date
- Custom event styling: rose-100 background, rose-700 text
- Month view by default with toolbar for month/week/day navigation
- "Today" button to return to current date
- Wrapped in a `Card` component below the bookings table

## Components

### `StatusSelect` (new)
- Dropdown (`<select>`) with status options
- Props: `currentStatus`, `type` (inquiry | booking), `onStatusChange`
- Inquiry options: ACCEPTED, CANCELLED, REJECTED (skip current status)
- Booking options: ACCEPTED, CANCELLED, REJECTED (skip current status)
- Styled: small text, border, rose focus ring

### `BookingCalendar` (new — wraps react-big-calendar)
- Props: `bookings: Booking[]`
- Maps bookings to react-big-calendar `Event` objects:
  ```ts
  { title: `Booking #${id}`, start: event_date, end: event_date, allDay: true }
  ```
- Uses `moment` for date handling (react-big-calendar's default adapter)
- Custom `eventPropGetter` for rose styling
- Localizer: `momentLocalizer(moment)`
- Wrapped in a Card with section title "Bookings Calendar"

## API Calls

All use `fetch()` with `credentials: "include"` (existing pattern):

```
GET /api/venues/:id              → venue detail object
GET /api/vendors/:id             → vendor detail object
GET /api/venues/:id/inquiries    → { inquiries: InquiryRow[] }
GET /api/vendors/:id/inquiries   → { inquiries: InquiryRow[] }
GET /api/venues/:id/bookings     → { bookings: BookingRow[] }
GET /api/vendors/:id/bookings    → { bookings: BookingRow[] }
PATCH /api/inquiries/:id/status  → { status: string }
PATCH /api/bookings/:id/status   → { status: string }
```

## Types (frontend)

Shared types for inquiry/booking rows will be defined in a new `frontend/src/types.ts`:

```ts
export interface Inquiry {
  id: number;
  client_id: number;
  service_type: string;
  service_id: number;
  event_date: string;
  status: "NEW" | "ACCEPTED" | "CANCELLED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  client_id: number;
  company_id: number;
  service_type: string;
  service_id: number;
  event_date: string;
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "REJECTED";
  created_at: string;
  updated_at: string;
}
```

Note: `Badge.tsx` currently imports types from `src/models/` (backend). The new frontend types will be independent — `Badge` will be updated to accept a string variant instead.

## File Structure

```
frontend/src/
  types.ts                    (new — shared Inquiry/Booking types)
  views/
    VenueDetailPage.tsx       (new)
    VendorDetailPage.tsx      (new)
    VenueManagementPage.tsx   (edit — add link on name column)
    VendorManagementPage.tsx  (edit — add link on name column)
  components/
    BookingCalendar.tsx       (new — wraps react-big-calendar)
    StatusSelect.tsx          (new)
    Badge.tsx                 (edit — accept string variant, remove backend import)
```

## Dependencies (new)

```
react-big-calendar
moment
@types/moment  (if needed by moment)
```

Run: `npm --prefix frontend install react-big-calendar moment`

## Color Palette & Tokens

Uses existing Tailwind stone/rose palette:
- Primary actions: `rose-600` / `rose-700`
- Text: `stone-900` (primary), `stone-600` (secondary), `stone-500` (muted)
- Borders: `stone-200`, `stone-100`
- Badge colors:
  - NEW: `blue-50` / `blue-700`
  - PENDING: `yellow-50` / `yellow-700`
  - ACCEPTED: `green-50` / `green-700`
  - REJECTED: `purple-50` / `purple-700`
  - CANCELLED: `stone-50` / `stone-500`

## Responsive Behavior

- **Desktop (md+):** Full table layout for inquiries/bookings, calendar full-width below
- **Mobile:** Stacked cards for inquiries/bookings, calendar full-width (react-big-calendar handles its own responsive behavior)
- Stats cards: 2-col grid on desktop, stacked on mobile
- Calendar: always full-width within its container
