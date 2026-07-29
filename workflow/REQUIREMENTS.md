# STU-22: Inquiry Messaging System

## Problem

Inquiries currently have no way for vendors/venues and clients to communicate within the platform. When a client sends an inquiry, the vendor has no built-in channel to reply, ask follow-up questions, or have a conversation. This limits the platform to a one-shot request/response model.

## Desired Outcome

A threaded messaging system tied to each inquiry, where both vendors/venues (via the admin dashboard) and clients (via a future iOS app) can send and read messages in chronological order. The system should use polling to keep messages relatively current without requiring WebSocket infrastructure on Cloudflare Workers. The admin dashboard should show the conversation thread per inquiry.

## Scope

### In scope
- New `messages` DB table with FK to `inquiries`
- Backend API: send message, list messages (with pagination), poll for new messages (`?since=<timestamp>`)
- Admin dashboard UI: message thread panel inside inquiry detail view (chronological list + compose box)
- Polling from admin dashboard (~5-10s interval)
- Auth enforcement: only participants of the inquiry (vendor/venue user or the client) can read/send messages
- Messages tagged with sender role (vendor user vs client user)

### Out of scope
- Client-facing mobile app (separate future effort — the API will support it)
- WebSocket or SSE real-time connections
- Push notifications
- File attachments in messages
- Message read receipts / typing indicators

## Architecture

### Database
New `messages` table:
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `inquiry_id` INTEGER NOT NULL (FK → inquiries.id, CASCADE DELETE)
- `sender_id` INTEGER NOT NULL (FK → users.id)
- `content` TEXT NOT NULL
- `created_at` TEXT DEFAULT localtime timestamp

### Backend API
- `GET /api/inquiries/:id/messages` — list all messages for an inquiry (ascending by created_at)
- `POST /api/inquiries/:id/messages` — send a new message (body: `{ content }`)
- `GET /api/inquiries/:id/messages?since=<ISO-timestamp>` — poll for messages after a given timestamp

### Admin Dashboard (Frontend)
- New `MessageThread` component shown within inquiry detail
- Messages displayed in a chat-like scrollable list, oldest to newest
- Simple text input + send button for replies
- `useEffect` with `setInterval` polling every 5-10s using `?since=` of the latest message timestamp

### Client API (future mobile app)
- Same API endpoints, authenticated via the same session mechanism
- Client sees only their own inquiry threads

## Linear Ticket

[STU-22: Inquiry Messaging System](https://linear.app/stuart-calverley/issue/STU-22/inquiry-messaging-system)
