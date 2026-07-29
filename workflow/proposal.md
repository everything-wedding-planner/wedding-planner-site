# STU-22: Inquiry Messaging System — Proposal

## Problem

Inquiries are currently one-shot: a client sends an inquiry, but vendors/venues have no built-in channel to reply, ask follow-ups, or hold a conversation within the platform. This limits the product to request/response with no ongoing dialogue.

## Proposed Solution

A threaded messaging system scoped to each inquiry, enabling vendors/venues (via the admin dashboard) and clients (via a future iOS app) to send and read messages in chronological order. Communication uses polling (no WebSockets), and the admin dashboard shows the conversation inline within each inquiry row.

## Key Changes

### Database — New Migration (`0005`) *— owned by you*

- `messages` table (as specified in REQUIREMENTS.md)
  - Adding explicit `sender_role` column (`CLIENT` | `VENDOR`)

### Backend — API Endpoints *— owned by you*

- Zod validation on message inputs
- `GET /api/inquiries/:id/messages` — list messages (ascending, paginated)
- `GET /api/inquiries/:id/messages?since=<ISO-timestamp>` — poll for new messages
- `POST /api/inquiries/:id/messages` — send a message (body: `{ content }`)
- Auth enforcement: only participants of the inquiry can read/send

### Frontend — New Components & API Hook *(my scope)*

- **New library/facility**: Custom `useApi` hook — typed fetch wrapper with `credentials: "include"`, JSON parsing, error handling, and generics
- **New component**: `MessageThread` — chat-like scrollable list inside the existing expandable inquiry section
- **New component**: `MessageCompose` — text input + send button
- **Polling**: `useEffect` + `setInterval` at 5–10s using `?since=<latest-message-timestamp>`
- **Existing page updates** (`VendorDetailPage.tsx`, `VenueDetailPage.tsx`): add `MessageThread` to expanded inquiry rows

### Message Flow

```
Client sends inquiry  →  Vendor sees inquiry in dashboard
                     →  Vendor opens expandable row
                     →  Vendor types reply in MessageCompose
                     →  POST /api/inquiries/:id/messages
                     →  Message appears in thread (polling picks it up)
                     →  Client sees it in future iOS app (same API)
```

## Success Criteria

- [x] Messages DB table created and migrated
- [x] Backend endpoints return/send messages with auth enforcement
- [x] Zod validation applied to all message inputs
- [x] Vendor/venue can view and send messages on any inquiry in their dashboard
- [x] Polling updates the message list every 5–10s
- [x] Messages display chronologically with sender role indicated
- [x] Tests for model, service, and controller layers

## Out of Scope (confirmed)

- Client-facing mobile app
- WebSockets / SSE
- Push notifications
- File attachments
- Read receipts / typing indicators
