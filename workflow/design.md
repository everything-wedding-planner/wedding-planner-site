# STU-18: Venue Management Page - Design Spec

## Overview
A table-based venue management page with inline editing, following existing dashboard patterns.

## Layout
- **Page container:** `space-y-6` (24px vertical spacing)
- **Header:** `text-xl sm:text-2xl font-bold text-stone-900`
- **Content cards:** Use existing `Card` component (`bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6`)

## Components

### 1. Venue Table
Reuse existing `DataTable` component with additional columns:

**Columns:**
1. **Name** (primary) - `font-medium text-stone-900`
2. **Address** - `text-stone-600`
3. **Capacity** - `text-stone-600`
4. **Contact** - `text-stone-600`
5. **Inquiries** - Badge with count (`bg-rose-100 text-rose-700 rounded-full px-2 py-0.5 text-xs font-medium`)
6. **Bookings** - Badge with count (`bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium`)
7. **Actions** - Edit/Save/Cancel buttons

### 2. Inline Editing
When "Edit" is clicked:
- Row transforms to editable form fields
- Input styling: `w-full px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500`
- Save button: `px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700`
- Cancel button: `px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50`

### 3. Add Venue Button
- Location: Top right of venues card
- Styling: `px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700`
- Icon: `Plus` from lucide-react

### 4. Photo Upload Field
Two input options:
1. **URL Input:** Standard text input for image URL
2. **File Upload:** Hidden file input with preview
   - Button: `px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-md hover:bg-stone-50`
   - Preview: `w-20 h-20 object-cover rounded-lg border border-stone-200`

## Form Fields (All Required)
| Field | Type | Validation |
|-------|------|------------|
| name | text | Required, min 2 chars |
| address | text | Required |
| capacity | number | Required, min 1 |
| contact_name | text | Required |
| email | email | Required, valid format |
| phone | tel | Required |
| photos | array | At least one photo URL or file |

## Responsive Design
- **Desktop (≥640px):** Table view with all columns
- **Mobile (<640px):** Card layout per venue (using DataTable's mobile view)

## Color Palette (from index.css)
- Primary: `rose-600` (#e11d48)
- Primary hover: `rose-700` (#be123c)
- Text: `stone-900` (#1c1917)
- Text secondary: `stone-600` (#57534e)
- Border: `stone-200` (#e7e5e4)
- Background: `stone-50` (#fafaf9)

## Typography
- Headings: `font-bold text-stone-900`
- Body: `text-sm text-stone-900`
- Labels: `text-sm font-medium text-gray-700`
- Muted: `text-xs text-stone-500`

## Spacing
- Card padding: `p-4 sm:p-6`
- Table cell padding: `px-4 py-3`
- Form field spacing: `space-y-4`
- Button gaps: `gap-3`

## Shadows & Borders
- Card shadow: `shadow-sm`
- Card border: `border border-stone-200`
- Input border: `border border-gray-200`
- Focus ring: `focus:ring-2 focus:ring-rose-500`

## States
- **Loading:** Spinner with `animate-spin text-rose-600`
- **Empty:** "No venues associated with this company."
- **Error:** Red error message with `text-red-600 text-sm`
- **Success:** Brief green success message with `text-green-600 text-sm`

## Interactions
1. **Edit:** Click "Edit" → row becomes editable form
2. **Save:** Click "Save" → API call → refresh data
3. **Cancel:** Click "Cancel" → revert to read-only view
4. **Add:** Click "Add Venue" → new editable row at top of table
5. **Delete:** Not in scope (out of scope per requirements)

## API Integration
- **GET** `/api/venues?companyId={id}` - Fetch venues with counts
- **POST** `/api/venues` - Create new venue
- **PUT** `/api/venues/{id}` - Update venue details
- **GET** `/api/venues/{id}/metrics` - Fetch inquiry/booking counts

## Accessibility
- Proper `aria-labels` on interactive elements
- Keyboard navigation support
- Focus management for form fields
- Screen reader announcements for status changes