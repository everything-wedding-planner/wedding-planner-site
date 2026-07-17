# STU-9: Dashboard Layout Design Spec

## Layout Structure

### Dashboard Shell
- **Full viewport height** (`min-h-screen`)
- **Flexbox row** layout: sidebar (responsive) + main content (flex-1)
- Background: `bg-stone-50` (warm off-white)

### Sidebar
- **Desktop (≥ 768px)**: Full width (256px), text + icons
- **Mobile (< 768px)**: Collapsed to icons only (64px)
- **Height**: Full viewport (`h-screen`)
- **Background**: `bg-white`
- **Border**: `border-r border-stone-200`
- **Padding**: `p-4`
- **Transition**: `transition-all duration-200` for smooth collapse

### Main Content Area
- **Flex**: `flex-1`
- **Padding**: `p-6`
- **Overflow**: `overflow-auto`

## Sidebar Design

### Header
- App name/logo at top
- Desktop: Full text — `text-lg font-semibold text-stone-800`
- Mobile: Hidden (or single icon/logo)
- Padding-bottom: `pb-4`
- Border-bottom: `border-b border-stone-200`

### Navigation Links
- **Container**: `mt-4 space-y-1`
- **Link style**:
  - Default: `flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-600 rounded-lg hover:bg-stone-100 hover:text-stone-900 transition-colors`
  - Active: `bg-rose-50 text-rose-700` (indicates current page)
- **Desktop**: Icon (20px) + text label
- **Mobile**: Icon only (20px), centered, text hidden
- **Icons**: Lucide icons (consistent across breakpoints)
- **Spacing**: `space-y-1` between links
- **Tooltip on mobile**: Consider `title` attribute for icon-only state

### Footer (Optional)
- Logout button at bottom
- User info/avatar placeholder
- Style: `mt-auto pt-4 border-t border-stone-200`

## Main Content Area

### Default View (DashboardHome)
- **Greeting**: `text-2xl font-bold text-stone-800` — "Welcome back, [Name]"
- **Subtitle**: `text-stone-600 mt-1` — "Let's plan your perfect day"
- **No cards** — keep it clean and simple for now

## Color Palette (Warm Rose/Stone)

| Token | Hex | Usage |
|-------|-----|-------|
| Rose 600 | `#e11d48` | Primary (active states, buttons) |
| Rose 50 | `#fff1f2` | Active nav background |
| Stone 50 | `#fafaf9` | Page background |
| Stone 100 | `#f5f5f4` | Hover states, borders |
| Stone 200 | `#e7e5e3` | Borders |
| Stone 500 | `#78716c` | Secondary text |
| Stone 600 | `#57534e` | Nav link text |
| Stone 800 | `#292524` | Headings, primary text |
| White | `#ffffff` | Cards, sidebar |

## Typography

| Element | Class |
|---------|-------|
| Page title | `text-2xl font-bold text-stone-800` |
| Section title | `text-lg font-semibold text-stone-800` |
| Body text | `text-sm text-stone-600` |
| Nav link | `text-sm font-medium` |
| Card value | `text-2xl font-bold text-stone-800` |

## Spacing

- Page padding: `p-6`
- Card padding: `p-6`
- Sidebar padding: `p-4`
- Gap between cards: `gap-6`
- Nav link padding: `px-3 py-2`
- Nav link icon gap: `gap-3`

## Responsive Behavior

### Desktop (≥ 768px)
- Full sidebar visible (256px)
- Text + icons in navigation
- App name/logo visible in header

### Mobile (< 768px)
- Sidebar collapsed to icons only (64px)
- App name/logo hidden
- Text labels hidden, only icons visible
- Icons centered in collapsed state
- Optional: hamburger toggle to expand sidebar as overlay

## States

### Loading
- Show skeleton loader in main content area
- Sidebar remains static

### Empty State
- DashboardHome shows a welcome message
- "Let's plan your perfect day" — simple and encouraging

## Border Radius

- Cards: `rounded-xl` (12px)
- Nav links: `rounded-lg` (8px)
- Buttons: `rounded-lg` (8px)
- Inputs (from AuthPage): `rounded-md` (6px) — keep consistent

## Shadows

- Sidebar: None (border-based separation)
- Cards (future): `shadow-sm` (subtle)
- Modals (future): `shadow-xl`
