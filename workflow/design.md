# AuthPage Design Specifications

**Ticket:** [STU-8](https://linear.app/stuart-calverley/issue/STU-8/modernize-authpage-styling)

## Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `gray-50` (#f9fafb) | Page background |
| Card | `white` (#ffffff) | Form container |
| Primary | `indigo-600` (#4f46e5) | Buttons, links |
| Primary Hover | `indigo-700` (#4338ca) | Button hover state |
| Text Primary | `gray-900` (#111827) | Headings |
| Text Secondary | `gray-600` (#4b5563) | Descriptions |
| Border | `gray-200` (#e5e7eb) | Input borders |
| Focus Ring | `indigo-500` (#6366f1) | Focus states |

## Typography

- **Heading**: `text-3xl font-extrabold` (30px, 800 weight)
- **Subheading**: `text-sm text-gray-600` (14px, regular weight)
- **Labels**: `text-sm font-medium text-gray-700` (14px, 500 weight)
- **Inputs**: `text-sm` (14px)
- **Button**: `text-sm font-medium` (14px, 500 weight)

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────────────┐        │
│         │    Heading      │        │
│         │   Subheading   │        │
│         │                 │        │
│         │  ┌───────────┐  │        │
│         │  │  Input 1  │  │        │
│         │  └───────────┘  │        │
│         │  ┌───────────┐  │        │
│         │  │  Input 2  │  │        │
│         │  └───────────┘  │        │
│         │  ┌───────────┐  │        │
│         │  │  Button   │  │        │
│         │  └───────────┘  │        │
│         │                 │        │
│         │  Contact Support│        │
│         └─────────────────┘        │
│                                     │
└─────────────────────────────────────┘
```

## Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Full width card, reduced padding |
| Tablet | 640px - 1024px | Centered card, standard padding |
| Desktop | > 1024px | Centered card, max-width constraint |

## Spacing

- Card padding: `p-8` (32px)
- Form spacing: `space-y-6` (24px between elements)
- Input padding: `px-3 py-2` (12px horizontal, 8px vertical)
- Button padding: `py-2 px-4` (8px vertical, 16px horizontal)

## Border Radius

- Card: `rounded-xl` (12px)
- Inputs: `rounded-md` (6px)
- Buttons: `rounded-md` (6px)

## Shadows

- Card: `shadow-md` (medium shadow)
- Focus: `focus:ring-2 focus:ring-offset-2`
