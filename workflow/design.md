# STU-22: Inquiry Messaging System — Design Spec

## Design Tokens (from existing `index.css`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#e11d48` (rose-600) | Send button, self-message bubble |
| `--color-primary-hover` | `#be123c` (rose-700) | Send button hover |
| `--color-primary-light` | `#fff1f2` (rose-50) | Other-party message bubble bg |
| `--color-background` | `#fafaf9` (stone-50) | Thread container bg |
| `--color-surface` | `#ffffff` | Self-message bubble bg, compose input bg |
| `--color-border` | `#e7e5e4` (stone-200) | Thread border, compose input border |
| `--color-text` | `#1c1917` (stone-900) | Message content |
| `--color-text-secondary` | `#57534e` (stone-600) | Sender name, timestamp |
| `--color-text-muted` | `#78716c` (stone-500) | Empty state text |
| `--color-bg-subtle` | `#f5f5f4` (stone-100) | Thread background, divider |
| `--color-bg-muted` | `#e7e5e4` (stone-200) | Scrollbar track |
| `--color-error` | `#dc2626` (red-600) | Error state text |
| `--color-gray-200` | `#e5e7eb` | Compose input border (form pattern) |
| `--color-gray-300` | `#d1d5db` | Send icon disabled |

## Layout

The messaging UI lives inside the **expanded inquiry row** on `VendorDetailPage.tsx` and `VenueDetailPage.tsx`. The expanded section currently shows a 2-column grid (`grid grid-cols-2 gap-2`) with client/service info. The `MessageThread` replaces or appends to that detail area.

### Container (expanded row inner div)

- Background: `--color-bg-subtle` (`bg-stone-100`)
- Padding: `p-3`
- Border radius: `rounded-lg`
- Max height: `320px` (thread scroll area only)
- Display: flex column (thread on top, compose on bottom)

### Message Thread (scrollable list)

- Flex: `flex-1 overflow-y-auto`
- Max height: `260px` (leaves room for compose)
- Gap between messages: `gap-2`
- Padding: `pr-1` (room for scrollbar)

### Message Bubble

**Self (vendor/venue user)**:
- Alignment: right
- Background: `bg-rose-600`
- Text color: `text-white`
- Border radius: `rounded-2xl rounded-br-sm`
- Padding: `px-3 py-1.5`
- Max width: `75%`
- Display: inline-block

**Other (client)**:
- Alignment: left
- Background: `bg-white border border-stone-200`
- Text color: `text-stone-900`
- Border radius: `rounded-2xl rounded-bl-sm`
- Padding: `px-3 py-1.5`
- Max width: `75%`
- Display: inline-block

### Message Header (within bubble)

- Sender label: `text-xs font-medium` — for "other" bubbles (e.g., "Client")
- Only shown on first message from a sender or after a gap

### Timestamp

- Below each bubble (right-aligned for self, left-aligned for other)
- Font: `text-[10px] text-stone-400`
- Display: block, `mt-0.5`

### Loading State

- Centered spinner: `animate-spin h-5 w-5 border-2 border-rose-600 border-t-transparent rounded-full`
- Sits in place of the message list

### Empty State

- Centered text: `text-sm text-stone-400 italic`
- Message: "No messages yet. Send the first message."

### Error State

- Centered text: `text-sm text-red-600`
- Message: "Failed to load messages"
- Retry button: `text-xs text-rose-600 hover:underline cursor-pointer`

### Compose Box (MessageCompose)

- Container: `flex gap-2 items-end`, `mt-2 pt-2 border-t border-stone-200`
- Textarea/input:
  - `flex-1 px-3 py-2 border border-gray-200 text-sm text-stone-900 rounded-md focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none`
  - Placeholder: `"Type a message..."`
  - Rows: 2, min height: `36px`, max height: `80px`
  - Auto-grow via scrollHeight or rows
- Send button:
  - `px-3 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed`
  - Icon: `Send` from lucide-react (`size={16}`)
  - Disabled when input is empty or submitting
- Character limit: displayed as subtle `text-xs text-stone-400` when approaching limit (optional — nice to have)

### Polling Indicator

- Subtle indicator when polling is active:
  - Green dot + "Live" text: `flex items-center gap-1 text-[10px] text-green-600`
  - Sits at the top-right of the thread header
  - Disappears when polling errored

## Component Architecture

```
InquiryRow (existing)
  └─ Expanded detail area (existing, modified)
       └─ MessageThread
            ├─ PollingIndicator (top-right)
            ├─ MessageList (scrollable)
            │   ├─ MessageBubble (self)
            │   ├─ MessageBubble (other)
            │   ├─ LoadingState
            │   ├─ EmptyState
            │   └─ ErrorState
            └─ MessageCompose
                 ├─ AutoGrowTextarea
                 └─ SendButton
```

## Component Props

### MessageThread

```ts
interface MessageThreadProps {
  inquiryId: number;
  clientName: string;       // display name for "other" messages
}
```

### MessageBubble

```ts
interface MessageBubbleProps {
  content: string;
  senderRole: "CLIENT" | "VENDOR";
  createdAt: string;        // ISO timestamp
  showSenderLabel?: boolean;
}
```

### MessageCompose

```ts
interface MessageComposeProps {
  inquiryId: number;
  onMessageSent: () => void;  // callback to trigger refetch
}
```

### useApi Hook

```ts
// Generic typed fetch wrapper
function useApi() {
  return {
    get: <T>(url: string) => Promise<{ data: T; error: string | null }>;
    post: <T>(url: string, body: unknown) => Promise<{ data: T; error: string | null }>;
  };
}
```

## States

### Empty
- No messages exist for this inquiry
- Show empty state text
- Compose box is active (ready to send)

### Loading
- Initial fetch in progress
- Show spinner
- Compose box is hidden or disabled

### Loaded
- Messages displayed chronologically
- Auto-scroll to bottom on first load and on new messages
- Compose box active

### Polling
- Interval active (every 5–10s)
- New messages appended to bottom
- Auto-scroll to bottom if already at bottom (not if user scrolled up)
- Show polling indicator

### Error
- Fetch failed
- Show error state with retry
- Previous messages remain visible if any (don't clear on error)

### Sending
- Compose button disabled with spinner
- Message optimistically NOT shown until confirmed by API (because we poll)
- On error: show inline error "Failed to send"

## Typography

All from Tailwind defaults — no custom fonts.

| Element | Class |
|---------|-------|
| Message content | `text-sm` |
| Sender label | `text-xs font-medium` |
| Timestamp | `text-[10px]` |
| Empty state | `text-sm italic` |
| Error state | `text-sm` |
| Polling indicator | `text-[10px]` |
| Input text | `text-sm` |

## Spacing & Sizing

| Element | Value |
|---------|-------|
| Thread padding | `p-3` |
| Message gap | `gap-2` |
| Bubble padding | `px-3 py-1.5` |
| Bubble max width | `75%` |
| Thread max height | `260px` |
| Input padding | `px-3 py-2` |
| Input border radius | `rounded-md` |
| Input min height | `36px` |
| Compose gap | `gap-2` |
| Send button padding | `px-3 py-2` |
| Send button radius | `rounded-md` |

## Responsive

- On mobile (below `sm` breakpoint): thread max-height reduces to `200px`
- All other dimensions scale down proportionally via Tailwind's `sm:` prefix where needed
- Compose box remains full-width on all breakpoints

## Accessibility

- Send button has `aria-label="Send message"`
- Message list has `role="log"` and `aria-live="polite"` for screen reader updates
- Input has `aria-label="Message input"`
- Polling status has `aria-live="polite"` (screen reader announces new messages)
- Focus management: focus input after send
- Keyboard: Enter sends (with Shift+Enter for newline)
