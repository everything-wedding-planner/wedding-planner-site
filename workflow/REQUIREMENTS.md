# STU-21: Add image gallery to venues and vendors

## Problem
Venues and vendors currently have no way to showcase visual content. Listings are text-only, which limits how vendors present their services and how potential clients evaluate them.

## Desired Outcome
Each venue and vendor can have a gallery of multiple images. Images are uploaded from the venue/vendor detail page. Thumbnails appear in the management list/table views, and the full gallery is shown on the detail pages. A 5 MB per-file size limit is enforced.

## Scope

### In scope
- Enable the existing R2 bucket in `wrangler.jsonc` and wire it into the `Env` type
- Add a single `image` table (via D1 migration) with `ref_type` ('venue' | 'vendor'), `ref_id`, `r2_key`, `display_order`, `created_at` — consistent with the polymorphic pattern used by `bookings` and `inquiries`
- Backend API endpoints:
  - `POST /api/images` — upload one or more images for a venue or vendor (multipart form data, `ref_type` + `ref_id` in body, 5 MB limit per file)
  - `DELETE /api/images/:imageId` — remove an image
  - `PUT /api/images/reorder` — set display order for a ref_type + ref_id set
  - `GET /api/images?ref_type=venue&ref_id=123` — list images for a given entity
- Serve image URLs via R2 public access (or a signed-URL proxy endpoint)
- Update `VenueResponseDTO` / `VendorResponseDTO` to include an `images` array
- Frontend:
  - Venue/Vendor list views (`VenueManagementPage`, `VendorManagementPage`) show a thumbnail column or card thumbnail
  - Detail pages (`VenueDetailPage`, `VendorDetailPage`) display the image gallery with upload, delete, and drag-to-reorder capabilities
  - File validation: only image types (jpg, png, webp), max 5 MB per file
- Update backend tests for new endpoints

### Out of scope
- Image cropping / resizing / transformation
- Bulk upload / CSV import of images
- Public-facing (non-admin) display of images
- Image captions or alt-text editing
- Image storage quotas beyond the 5 MB per-file limit

## Linear Ticket
https://linear.app/stuart-calverley/issue/STU-21/add-image-gallery-to-venues-and-vendors
