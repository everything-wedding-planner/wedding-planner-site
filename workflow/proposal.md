# STU-22: Inquiry Messaging System — Proposal

## Problem

Inquiries are currently one-shot: a client sends an inquiry, but vendors/venues have no built-in channel to reply, ask follow-ups, or hold a conversation within the platform. This limits the product to request/response with no ongoing dialogue.

## Status

| Area | State |
|------|-------|
| Schema (`conversations` + `messages` tables) | Done (migrations 0005, 0006) |
| Backend API (conversations + messages routes) | Done |
| Backend hardening (`?since=` polling, participant auth) | Planned |
| Frontend API layer (`useApi` hook, types) | Planned |
| Inline message threads on vendor/venue detail pages | Planned |
| Dedicated Messages inbox page | Planned |

## Proposed Solution

A threaded messaging system scoped to each inquiry, backed by two tables:

- **`conversations`** — one per inquiry; polymorphic `reference_id`/`reference_type` (points at the vendor or venue), `client_id`, and a mutable `status` (`active`/`closed`/…)
- **`messages`** — chronological messages under a conversation, each tagged with `message_role` (`client` | `vendor` | `venue`) and a nullable `read_at`

Vendors/venues communicate with clients through the admin dashboard — both **inline within expanded inquiry rows** and via a **dedicated Messages inbox page** — while clients will eventually communicate via a future iOS app using the same API. Communication uses polling (no WebSockets/SSE).

## Features

### F1 — Schema: conversations + messages _(done, owned by you)_

- `0005_create-conversations-table.sql` — `conversations`: `id`, `inquiry_id` (FK), `client_id` (FK), `reference_id`, `reference_type` (`vendor`/`venue`), `status`, `created_at`, `updated_at`
- `0006_create-messages-table.sql` — `messages`: `id`, `conversation_id` (FK), `message_role`, `content`, `read_at`, `created_at`, `updated_at`
- Model / service / DTO layers per existing backend conventions

### F2 — Conversations API _(done, owned by you)_

- `GET /api/conversations/:id` — one conversation with enriched `client`, `reference_object`, and `messages`
- `GET /api/conversations/reference/:reference_type/:reference_id` — all conversations for a vendor/venue (powers the inbox + detail-page threads)
- `POST /api/conversations` — create conversation (`client_id`, `inquiry_id`, `reference_id`, `reference_type`)
- `PUT /api/conversations/:id/status` — update conversation status

### F3 — Messages API _(done, owned by you)_

- `POST /api/messages` — send a message (`conversation_id`, `message_role`, `content`)
- `PUT /api/messages/:id/read` — mark a message as read (`read_at`)

### F4 — Backend hardening: polling + auth _(planned, backend — recommended placement)_

Rationale: security and payload efficiency belong on the server; a frontend-only approach is bypassable and re-fetches the full thread on every poll.

- `GET /api/conversations/:id/messages?since=<ISO-timestamp>` — return only messages created after the timestamp (SQL `WHERE created_at > ?`, ascending). Powers lightweight polling.
- **Participant auth enforcement**: only the conversation's client, or a user of the company that owns the referenced vendor/venue, may read/send in a conversation (404/403 otherwise). Extends the existing global session middleware.
- Pagination deliberately **not** added — message lists per conversation are bounded and poll-driven (see Out of Scope).

### F5 — Frontend API layer: `useApi` hook + types _(planned, my scope)_

- `frontend/src/hooks/useApi.ts` — typed `fetch` wrapper: `credentials: "include"`, JSON parsing, error handling, generics
- Frontend mirror types for `conversationResponseDTO` / `messageResponseDTO` (import from `src/DTO` like existing pages do, or duplicate in `frontend/src/types.ts`)
- Small hooks (`useConversation`, `useConversationsByReference`) wrapping the endpoints

### F6 — Inline message threads on detail pages _(planned, my scope)_

- New `MessageThread` + `MessageCompose` components embedded in the **expanded inquiry row** on `VendorDetailPage.tsx` and `VenueDetailPage.tsx`
- Conversation fetched via `reference_type` + `reference_id` (the page's vendor/venue id) and matched to the inquiry by `conversation.inquiry_id`
- Polling every 5–10s using `?since=<latest-message-timestamp>`
- Messages display chronologically with sender role indicated (self = vendor/venue bubble right, client bubble left)

### F7 — Dedicated Messages inbox page _(planned, my scope)_

- New route `messages` in `frontend/src/Router.tsx` + sidebar nav item (icon: `MessageSquare`)
- Reference selector (vendor/venue) — scoped because conversations are keyed per reference; defaults via optional query params `?ref_type=&ref_id=` (e.g. a "Messages" shortcut from detail pages)
- Left pane: conversation list (client, reference, last message preview, unread badge, status). Right pane: `MessageThread` + `MessageCompose`
- Active polling on the open thread; conversation list refreshes on a slower cadence or after send

## Message Flow

```
Client sends inquiry
  → conversation created (POST /api/conversations, one per inquiry)
  → vendor/venue sees conversation in Messages inbox (GET /reference/:type/:id)
  → opens thread inline in inquiry row or in inbox
  → types reply in MessageCompose
  → POST /api/messages (message_role = "vendor" | "venue")
  → poll GET /api/conversations/:id/messages?since=... picks it up
  → client sees it in future iOS app (same API, message_role = "client")
```

## Success Criteria

- [x] `conversations` + `messages` tables created and migrated
- [x] Conversation endpoints return/create/update conversations
- [x] Message endpoints send messages and mark read
- [x] `?since=` polling param returns only new messages
- [ ] Participant-only auth enforced on read/send
- [x] Vendor/venue can view and send messages on any inquiry in their dashboard
- [ ] Dedicated Messages inbox page lists conversations and opens threads
- [ ] Inline thread embedded in expanded inquiry rows on vendor and venue detail pages
- [ ] Polling updates the message list every 5–10s
- [ ] Messages display chronologically with sender role indicated
- [ ] Tests for model, service, and controller layers (backend) + component tests (frontend)

## Out of Scope (confirmed)

- Client-facing mobile app (API will support it)
- WebSocket / SSE real-time connections
- Push notifications
- File attachments in messages
- Read receipts / typing indicators
- Message pagination (bounded, poll-driven threads)
- Aggregating conversations across all of a company's vendors/venues in one API call (inbox page fetches per selected reference)
