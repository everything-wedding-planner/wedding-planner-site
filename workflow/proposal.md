# STU-24 Proposal: AI Assistant Inline Chat Panel

## Problem

Users (vendors/venues) juggle inquiries, bookings, deadlines, and analytics inside the admin dashboard with no in-app assistant. They must manually dig through pages to summarize conversations, recall upcoming deadlines, and pull data insights.

## Proposed Solution

A slide-in AI assistant panel that pops out from the right edge of the dashboard — available on every dashboard page and toggled open/closed by the user. It is a chat interface where users ask questions and receive structured answers covering the three use cases (conversation summaries, upcoming deadlines, data insights).

This phase delivers **frontend scaffolding only**: the full UI is interactive but assistant replies come from a swappable response layer. The response layer is designed behind a small interface so a real AI integration can replace mocks shortly after without reworking the UI.

### UX notes (user decision)

- Panel is **always present but closed by default**, sliding in from the right like a side panel/drawer — it does not permanently occupy layout space. This refines the original REQUIREMENTS.md ("persistent inline panel") per the user's direction.
- Toggled via a persistent floating trigger (launcher) so it's accessible from any dashboard page.
- Chat history and open/closed state persist across route navigation (in-memory).

## Key Changes

### Frontend (React SPA)

- **`AssistantProvider`** (React Context) — holds:
  - `isOpen` / `toggle` / `close` (panel visibility)
  - `messages: ChatMessage[]` (in-memory chat history, survives route changes)
  - `isTyping` (assistant "typing" state)
  - `sendMessage(text)` (appends user message, delegates to the response layer)
- **`AssistantLauncher`** — floating button fixed to the right edge that opens the panel. Gives the panel a discreet entry point on every dashboard page.
- **`AssistantPanel`** — slide-in drawer component with:
  - Header (title, mock/AI status badge, close button)
  - Message list (reuses the existing bubble visual language)
  - Suggestion chips for the three use cases
  - Compose input (Enter to send, Shift+Enter for newline, autosize)
  - Typing indicator while awaiting a response
  - Focus management: focus moves into the panel on open and returns to the launcher on close; Escape closes
- **Composable sub-components**, matching the existing `MessageBubble` / `MessageCompose` split: e.g. `AssistantMessageList`, `AssistantMessageBubble`, `AssistantSuggestionChips`, `AssistantCompose`, `TypingIndicator`.
- **Response layer** — a small interface (e.g. `getAssistantResponse(input: string): Promise<AssistantReply>`) with one implementation for now:
  - `MockAssistantService` — keyword/intent-matched canned replies for the three use cases, plus a graceful fallback ("I can help summarize conversations, deadlines, and insights…").
  - Real AI drops in later by swapping this one service; the panel code does not change.

### Backend

None in this phase.

### Data / State

No persistence. Chat lives in React Context memory only, reset on full page reload.

### Tests

Frontend tests (vitest + Playwright) covering: open/close behaviour, sending a message produces a mock reply, suggestion chip sends a prompt, Escape closes, chat persists across route navigation.

## Success Criteria

- Launcher and panel render on all dashboard routes; panel slides in/out from the right.
- User can send a message (typed or via suggestion chip) and receive a structured mock reply for each of the three use cases.
- Typing indicator shows while a reply is pending; input is disabled while awaiting a reply.
- Chat history and panel state persist when navigating between dashboard pages; reset on reload (acceptable for this phase).
- Response layer is isolated behind an interface so a real AI service can replace mocks without UI changes.
- Accessible: keyboard operable, Escape closes, focus moves appropriately, controls labelled.
- Frontend lint, tsc, and tests pass.

## Out of Scope (this phase)

- Backend endpoints, real AI/LLM provider, streaming
- DB persistence of chat history
- Assistant auth/permissions or per-user context
- Feeding real analytics/inquiry data into responses (mock data is fine)
- Mobile-native chat UX (panel should behave sensibly on mobile, but is not the focus)

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-24/ai-assistant-inline-chat-panel-design-frontend-scaffolding
