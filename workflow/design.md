# STU-22: Inquiry Messaging System — Design Spec

## Data Model & API Contract

### Schema (migrations 0005 / 0006)

**`conversations`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | |
| `inquiry_id` | INTEGER NOT NULL | FK → `inquiries.id` |
| `client_id` | INTEGER NOT NULL | FK → `users.id` |
| `reference_id` | INTEGER NOT NULL | FK → vendor/venue id |
| `reference_type` | TEXT NOT NULL | `vendor` \| `venue` (polymorphic) |
| `status` | TEXT NOT NULL | default `active` |
| `created_at` / `updated_at` | TIMESTAMP | |

**`messages`**

| Column | Type | Notes |
|--------|------|-------|
| `id` | INTEGER PK | |
| `conversation_id` | INTEGER NOT NULL | FK → `conversations.id` |
| `message_role` | TEXT NOT NULL | `client` \| `vendor` \| `venue` |
| `content` | TEXT NOT NULL | |
| `read_at` | TIMESTAMP | nullable; set via `PUT /:id/read` |
| `created_at` / `updated_at` | TIMESTAMP | |

### `message_role` semantics

The role is who authored the message, stored as free text but the UI only understands three values:

- `client` — the inquiring client (rendered as "other" in the dashboard)
- `vendor` — the vendor's staff user (self on vendor pages)
- `venue` — the venue's staff user (self on venue pages)

**Self detection**: a message is "self" when `message_role === reference_type` of the page context. Example: on a vendor page, `vendor` = self, `client` = other. The future iOS app always sends `client`.

### Backend routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/conversations/:id` | One conversation (enriched `client`, `reference_object`, `messages`) |
| GET | `/api/conversations/reference/:reference_type/:reference_id` | All conversations for a vendor/venue |
| POST | `/api/conversations` | Create conversation `{ client_id, inquiry_id, reference_id, reference_type }` |
| PUT | `/api/conversations/:id/status` | Update status `{ newStatus }` |
| POST | `/api/messages` | Send `{ conversation_id, message_role, content }` |
| PUT | `/api/messages/:id/read` | Mark read |
| GET | `/api/conversations/:id/messages?since=<ISO>` | **Planned** — messages after timestamp, ascending |

### Participant auth (planned, backend)

Middleware/service check: the session user is the conversation's `client_id`, **or** their company owns the `reference_object`. Otherwise 404 (don't leak existence) on read and 403 on write.

## Frontend API Layer

### `useApi` hook (`frontend/src/hooks/useApi.ts`)

Typed fetch wrapper following the `useImages` hook pattern (`frontend/src/hooks/useImages.ts`).

```ts
function useApi() {
  return {
    get: <T>(url: string) => Promise<{ data: T | null; error: string | null }>;
    post: <T>(url: string, body: unknown) => Promise<{ data: T | null; error: string | null }>;
    put: <T>(url: string, body: unknown) => Promise<{ data: T | null; error: string | null }>;
  };
}
```

Always sends `credentials: "include"` and `Content-Type: application/json` (when a body exists). Returns `{ data, error }` so callers never throw.

### Feature hooks

- `useConversationsByReference(referenceType, referenceId)` — fetches the conversation list; used by the inbox and to match a conversation to an inquiry on detail pages. Exposes `conversations`, `isLoading`, `error`, `refetch`.
- `useMessageThread(conversationId, { selfRole, enabled })` — manages the message array + polling. Exposes `messages`, `isLoading`, `error`, `isPolling`, `send(content)`, `markRead()`. Polls only while `enabled` (i.e. the thread is visible).

### Frontend types

Mirror the backend DTOs (import from `../../../src/DTO/Communication/*` where practical, matching existing pages which import `src/DTO/*` types):

```ts
interface FrontendConversation {
  id: number;
  client: { id: number; username: string } | null;
  inquiry: number;
  reference_object: { id: number; name: string } | null;
  messages: FrontendMessage[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface FrontendMessage {
  id: number;
  conversation_id: number;
  message_role: "client" | "vendor" | "venue";
  content: string;
  read_at: string | null;
  created_at: string;
}
```

## Component Architecture

Two entry points share the same thread components.

### Inline (detail pages)

```
VendorDetailPage / VenueDetailPage (existing)
  └─ InquiryRow / InquiryCard (existing) — expanded state
       └─ InquiryMessageThread        (new)
            └─ MessageThread (shared)
            └─ MessageCompose (shared)
```

On expand, `InquiryMessageThread` resolves the conversation for `inquiry.id` from `useConversationsByReference(reference_type, reference_id)` (match on `conversation.inquiry`), then renders `MessageThread`. If no conversation exists for that inquiry yet, show a subtle "No conversation for this inquiry" note (creation is driven by the client side / future app).

### Inbox page (dedicated)

```
MessagesInboxPage (new, route: /messages)
  ├─ ReferencePicker        — vendor/venue selector (or preset via ?ref_type=&ref_id=)
  ├─ ConversationList       — left pane: client, preview, unread badge, status
  └─ ConversationPane       — right pane
       └─ MessageThread (shared)
       └─ MessageCompose (shared)
```

- Sidebar nav item added in `DashboardLayout.tsx` (`navItems`): `{ to: "/messages", label: "Messages", icon: MessageSquare, shouldShow: true }`.
- Route added in `frontend/src/Router.tsx` under the `DashboardLayout` children.
- Detail pages get a "Messages" shortcut link to `/messages?ref_type=vendor&ref_id=<id>`.
- `ConversationList` refresh cadence is slower (e.g. 30s) than the open thread; it also refreshes after a send.

## Thread Components

### `MessageThread`

```ts
interface MessageThreadProps {
  conversationId: number;
  selfRole: "vendor" | "venue";
  clientName?: string;            // label for "other" bubbles
  maxHeightClass?: string;        // inline (320px) vs inbox (flex-1)
  onConversationClosed?: () => void;  // inbox: close button
}
```

- Fetch via `useMessageThread(conversationId, { selfRole, enabled: true })`
- Scroll container with `role="log"` + `aria-live="polite"`
- Auto-scroll to bottom on first load and on new messages **only if the user is already at the bottom**
- Polling indicator top-right (green dot + "Live") while `isPolling`
- Close/back button (inbox pane only)

### `MessageBubble`

```ts
interface MessageBubbleProps {
  content: string;
  self: boolean;
  senderLabel?: string;       // shown on first message from a sender
  createdAt: string;          // ISO timestamp
}
```

**Self**: right-aligned, `bg-rose-600 text-white`, `rounded-2xl rounded-br-sm`, `px-3 py-1.5`, max-w 75%.
**Other**: left-aligned, `bg-white border border-stone-200 text-stone-900`, `rounded-2xl rounded-bl-sm`, `px-3 py-1.5`, max-w 75%.
**Timestamp**: below each bubble (`text-[10px] text-stone-400`, `mt-0.5`, right-aligned for self / left for other). Sender label (`text-xs font-medium`) only on the first message of a sender run or after a gap.

### `MessageCompose`

```ts
interface MessageComposeProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}
```

- `flex gap-2 items-end mt-2 pt-2 border-t border-stone-200`
- Auto-growing textarea (`resize-none`, min 36px, max 80px, `aria-label="Message input"`), Enter sends, Shift+Enter newline
- Send button: `px-3 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed`, `Send` icon from lucide-react (`size={16}`), `aria-label="Send message"`
- Disabled while empty or sending; on failure show inline `text-xs text-red-600` "Failed to send"
- Sent messages are **not** optimistically appended — the poll confirms them (consistent with the single source of truth)

## Polling Design

- Interval: **5–10s** (`setInterval` in `useMessageThread`), driven by the latest `created_at` in state
- Request: `GET /api/conversations/:id/messages?since=<ISO-lastCreatedAt>` (planned backend param)
- On success: append returned messages, update `lastCreatedAt`, set `isPolling = true`
- On network error: keep previous messages visible, set `isPolling = false` (indicator disappears), retry on next tick; do **not** clear the list
- Polling pauses when the thread is hidden (expanded row collapsed / inbox tab switched) or `document.hidden`
- Read tracking: after the thread renders new messages from the other party, fire `PUT /api/messages/:id/read` for the newest unread id (fire-and-forget)

## Design Tokens (from `frontend/src/index.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#e11d48` (rose-600) | Send button, self bubble |
| `--color-primary-hover` | `#be123c` (rose-700) | Send button hover |
| `--color-primary-light` | `#fff1f2` (rose-50) | Inbox active row, badge bg |
| `--color-background` | `#fafaf9` (stone-50) | Page bg |
| `--color-surface` | `#ffffff` | Bubbles, panes, inputs |
| `--color-border` | `#e7e5e4` (stone-200) | Pane/thread borders |
| `--color-text` | `#1c1917` (stone-900) | Message content |
| `--color-text-secondary` | `#57534e` (stone-600) | Sender name, metadata |
| `--color-text-muted` | `#78716c` (stone-500) | Empty state |
| `--color-bg-subtle` | `#f5f5f4` (stone-100) | Thread bg, thread container |
| `--color-bg-muted` | `#e7e5e4` (stone-200) | Scrollbar track, dividers |
| `--color-error` | `#dc2626` (red-600) | Error text |
| `--color-gray-200` | `#e5e7eb` | Compose input border |
| `--color-gray-300` | `#d1d5db` | Send icon disabled |

## Layout & Styling

### Inline thread (expanded inquiry row)

- Container: `bg-stone-100 rounded-lg p-3` (replaces the existing 2-col detail grid content or appends below it)
- Thread list: `flex-1 overflow-y-auto`, max-height **260px**, `gap-2`, `pr-1`
- Compose pinned at the bottom
- On mobile (< `sm`): thread max-height **200px**

### Inbox page (`/messages`)

- Two-pane layout: `grid md:grid-cols-[320px_1fr] gap-0` inside a `Card`
- **Left (ConversationList)**: list of rows — client name/username, `text-xs` last-message preview (truncated, `truncate`), unread dot (`bg-rose-600 h-2 w-2 rounded-full`), status `Badge`; active row `bg-rose-50`; border-r `border-stone-200`
- **Right (ConversationPane)**: header row (client name, reference name, status `Badge`, close `X`), thread `flex-1 overflow-y-auto` filling remaining height, compose pinned bottom
- Thread area height: `h-[60vh]` on desktop, `h-[50vh]` on mobile
- Empty states: no reference selected → "Select a vendor or venue"; no conversations → "No conversations yet"; thread area reuses `MessageThread` empty state

### Thread states

| State | Behavior |
|-------|----------|
| Loading | Centered spinner (`animate-spin h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full`) in place of list |
| Empty | Centered `text-sm text-stone-400 italic` — "No messages yet. Send the first message." |
| Loaded | Chronological bubbles, auto-scroll to bottom |
| Polling | Append new messages; auto-scroll only if at bottom; "Live" indicator |
| Error (fetch) | "Failed to load messages" (`text-sm text-red-600`) + retry (`text-xs text-rose-600 hover:underline cursor-pointer`); keep prior messages |
| Sending | Compose disabled with spinner; inline "Failed to send" on error |

## Typography

All Tailwind defaults — no custom fonts.

| Element | Class |
|---------|-------|
| Message content | `text-sm` |
| Sender label | `text-xs font-medium` |
| Timestamp / metadata | `text-[10px]` / `text-xs` |
| Conversation preview | `text-xs truncate` |
| Empty/error state | `text-sm` |
| Polling indicator | `text-[10px]` |
| Input text | `text-sm` |

## Spacing & Sizing

| Element | Value |
|---------|-------|
| Thread container padding | `p-3` |
| Message gap | `gap-2` |
| Bubble padding | `px-3 py-1.5` |
| Bubble max width | `75%` |
| Inline thread max height | `260px` (200px mobile) |
| Inbox thread height | `60vh` desktop / `50vh` mobile |
| Input padding | `px-3 py-2` |
| Input min/max height | `36px` / `80px` |
| Compose gap | `gap-2` |
| Send button | `px-3 py-2 rounded-md` |

## Responsive

- Below `sm`: inline thread shrinks to `200px`; inbox becomes single column (list on top, thread below) or keeps the grid via `md:` prefix
- Compose stays full-width at all breakpoints

## Accessibility

- Send button + input have `aria-label`s
- Message list: `role="log"` with `aria-live="polite"`
- Polling status: `aria-live="polite"` (announce new messages)
- Focus the input after send; Enter to send, Shift+Enter for newline
- Unread indicators are not the sole cue (paired with visible preview text)

## Testing

- **Backend**: extend `src/test` — service/model tests for `?since=` filtering and participant auth (mirroring existing `inquiryService.test.ts` / `bookingService.test.ts` style)
- **Frontend**: vitest + Playwright (per `frontend/package.json`) — component tests for `MessageThread` states, `MessageCompose` send, and a page test for the inbox (mock the conversation endpoints)
- tsconfig `noUnusedLocals`/`noUnusedParameters` applies — keep imports clean
