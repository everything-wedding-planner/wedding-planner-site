# STU-21: Add image gallery to venues and vendors — Proposal

## Problem
Venues and vendors currently have no way to showcase visual content. Listings are text-only, which limits how vendors present their services and how potential clients evaluate them.

## Proposed Solution
Add a polymorphic image gallery to both venues and vendors. The backend provides image CRUD endpoints and R2-backed public URLs. The frontend gets a gallery component with upload, delete, and drag-to-reorder capabilities via `@dnd-kit`, plus thumbnails in management list views.

## Backend API Contract

The backend will expose these endpoints. Frontend implementation depends on them:

| Method | Path | Body/Params | Response |
|--------|------|-------------|----------|
| `GET` | `/api/images` | Query: `ref_type`, `ref_id` | `{ images: ImageDTO[] }` |
| `POST` | `/api/images` | Multipart: `images[]`, `ref_type`, `ref_id` | `{ images: ImageDTO[] }` |
| `DELETE` | `/api/images/:id` | — | `{ success: true }` |
| `PUT` | `/api/images/reorder` | `{ items: [{ id, display_order }] }` | `{ success: true }` |

**`ImageDTO` shape:**
```ts
interface ImageDTO {
  id: number;
  url: string;       // Public R2 URL
  display_order: number;
  created_at: string;
}
```

**Constraints:** 5 MB max per file. Accepted types: jpg, png, webp.

## Frontend Changes

### New files
| File | Purpose |
|------|---------|
| `frontend/src/components/ImageGallery.tsx` | Gallery grid with upload zone, delete buttons, drag-to-reorder |
| `frontend/src/components/ImageUploadZone.tsx` | Drag-and-drop / click-to-upload file input |
| `frontend/src/hooks/useImages.ts` | Custom hook encapsulating image API calls |

### Updated files
| File | Change |
|------|--------|
| `frontend/src/views/VenueDetailPage.tsx` | Render `<ImageGallery>` |
| `frontend/src/views/VendorDetailPage.tsx` | Render `<ImageGallery>` |
| `frontend/src/views/VenueManagementPage.tsx` | Add thumbnail column/card |
| `frontend/src/views/VendorManagementPage.tsx` | Add thumbnail column/card |
| `frontend/package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |

### Gallery component behavior
- Responsive grid: 3 columns desktop, 2 mobile
- First image is the "cover" (display_order = 0)
- Upload zone as a dashed-border tile with a "+" icon
- Delete button (X) on each image with confirmation popover
- Drag handles for reordering
- File validation: jpg, png, webp only; 5 MB max

### Thumbnail in list views
- Table column: 48×48 rounded thumbnail, placeholder icon if no images
- Mobile card: thumbnail at the top of the card

## Success Criteria
- [ ] Images can be uploaded via the detail page for both venues and vendors
- [ ] Thumbnails appear in management list/table views
- [ ] Full gallery with upload, delete, and drag-to-reorder on detail pages
- [ ] 5 MB per-file limit enforced; only jpg/png/webp accepted
- [ ] No regressions in existing venue/vendor functionality

## Linear Ticket
https://linear.app/stuart-calverley/issue/STU-21/add-image-gallery-to-venues-and-vendors
