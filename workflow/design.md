# STU-21: Image Gallery — Design Spec

## Design Tokens

Uses existing Tailwind v4 tokens. No new color palette — the gallery follows the existing neutral/white card aesthetic.

| Token | Value | Usage |
|-------|-------|-------|
| `bg-card` | `white` | Gallery container background |
| `border-default` | `gray-200` | Image borders, upload zone dashed border |
| `border-hover` | `gray-300` | Upload zone hover state |
| `text-muted` | `gray-500` | Upload zone helper text |
| `radius-lg` | `rounded-lg` | Image cards, upload zone |
| `radius-md` | `rounded-md` | Thumbnails in list views |
| `shadow-sm` | `shadow-sm` | Gallery container |

## Layout

### Detail Page Gallery

```
┌─────────────────────────────────────────────────┐
│  Images                                    [+]  │  ← Card header with upload button
├─────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│  │ 📷   │ │ 📷   │ │ 📷   │ │  +   │           │  ← Image grid (3 cols desktop, 2 mobile)
│  │  ✕   │ │  ✕   │ │  ✕   │ │upload│           │
│  │ ≡≡≡  │ │ ≡≡≡  │ │ ≡≡≡  │ │      │           │  ← Drag handle + delete button per image
│  └──────┘ └──────┘ └──────┘ └──────┘           │
└─────────────────────────────────────────────────┘
```

- **Grid:** CSS Grid, `grid-cols-3` on desktop (`sm:` breakpoint+), `grid-cols-2` on mobile
- **Gap:** `gap-3` (0.75rem / 12px)
- **Image cards:** Aspect-ratio square (`aspect-square`), `object-cover` for the `<img>`
- **Upload zone:** Dashed border (`border-2 border-dashed border-gray-300`), same square aspect ratio

### List View Thumbnails

**Table column:**
- 48×48px rounded-md thumbnail
- If no images: show a `ImageIcon` (from lucide-react) placeholder in `gray-300`
- Column width: fixed `w-16`

**Mobile card:**
- Thumbnail at top of card, full width, `h-32 object-cover rounded-t-lg`
- If no images: skip the thumbnail area entirely (or show a gray placeholder strip)

## Image Card States

| State | Visual |
|-------|--------|
| **Default** | Image fills card, subtle `shadow-sm` border |
| **Hover** | Delete button (X) appears top-right, slight `shadow-md` lift |
| **Dragging** | `opacity-50` on the dragged item, `scale-105` on the drop target placeholder |
| **Uploading** | Skeleton shimmer animation on the upload zone tile |
| **Error** | Red border + error toast notification |

## Upload Zone

- **Size:** Same as image card (`aspect-square`)
- **Border:** `border-2 border-dashed border-gray-300`, `rounded-lg`
- **Hover:** Border color changes to `border-gray-400`, background `bg-gray-50`
- **Content:** Centered `Plus` icon (lucide) + "Upload" text in `text-gray-400`
- **Click:** Opens native file picker (`<input type="file" multiple accept="image/jpeg,image/png,image/webp">`)
- **Drag over:** Border turns `border-blue-400`, background `bg-blue-50`

## Delete Confirmation

- Clicking ✕ on an image shows a confirmation popover (not a modal)
- Popover: "Remove this image?" with "Cancel" and "Remove" buttons
- "Remove" button is `bg-red-500 text-white`
- Clicking outside the popover dismisses it

## Drag-to-Reorder

- Uses `@dnd-kit/sortable` with `SortableContext` + `useSortable` per image
- Drag handle: `GripVertical` icon (lucide) at bottom-center of each image card
- Visual feedback:
  - Dragged item: `opacity-40`, `z-50`
  - Placeholder: Dashed border outline where the item will land
  - Other items animate into position (`transition-transform duration-200`)
- On drop: call reorder API with the new `display_order` for each image

## Responsive Behavior

| Breakpoint | Grid | Card Size | List Thumbnail |
|------------|------|-----------|----------------|
| `< 640px` (mobile) | 2 columns | ~160px | 40×40px |
| `>= 640px` (desktop) | 3 columns | ~200px | 48×48px |

## Empty State

When no images exist:
- Gallery area shows the upload zone only, centered, with larger text: "Add images to showcase this venue/vendor"
- List views show the `ImageIcon` placeholder

## Error States

| Error | UI |
|-------|----|
| File > 5 MB | Toast: "Image must be under 5 MB" (red) |
| Invalid file type | Toast: "Only JPG, PNG, and WebP images are supported" (red) |
| Upload failed | Toast: "Upload failed. Please try again." (red), upload zone returns to default |
| Delete failed | Toast: "Failed to remove image. Please try again." (red) |

## Accessibility

- Upload zone: `role="button"`, `tabIndex={0}`, keyboard Enter/Space triggers file picker
- Delete button: `aria-label="Remove image"`
- Drag handle: `aria-label="Reorder image"`, `aria-roledescription="sortable"`
- All interactive elements have focus-visible outlines (`focus-visible:ring-2 focus-visible:ring-blue-500`)
