# STU-25: AI Assistant backend — real AI, data grounding, per-session chat

## Problem

STU-24 delivered the AI assistant chat panel as frontend scaffolding with mock
responses. Users cannot yet get real answers: summarizing conversations,
surfacing upcoming deadlines, and explaining analytics currently return
hardcoded mock text with no connection to actual inquiry, booking, or analytics
data.

## Desired Outcome

A real backend for the assistant. When a logged-in vendor/venue asks a question
in the chat panel:

- The backend calls a real LLM via Cloudflare Workers AI (single-shot, not
  streaming).
- The answer is grounded in the user's actual data via read-only tool calls:
  conversations/messages (summaries), inquiries (interest), and bookings
  (upcoming deadlines).
- The reply is structured into blocks (heading / paragraph / bullets) so the
  existing chat UI can render it without frontend changes.
- The conversation is per-session: follow-up questions keep context within the
  current browser session, but no chat history is stored server-side — the
  conversation resets on reload or a new session.

## Scope

**In:**

- Enable the Cloudflare Workers AI binding (`wrangler.jsonc` + env types).
- New `/api/assistant` route (controller / service / model / DTO pattern):
  - Send a message → grounded, structured reply (single-shot).
- Tool-calling grounding: read-only tools (bookings, inquiries, conversations,
  conversation messages) scoped to the logged-in user's company, executed via
  Workers AI function calling.
- Protected by the existing session auth middleware.
- Backend tests (controller + service, mock the AI binding).
- Minimal frontend wiring so the existing chat UI posts real messages and
  receives real replies.

**Out (this phase):**

- Streaming responses (deferred).
- Chat persistence / history storage (deferred) — the conversation is
  per-session only and not stored server-side.
- Analytics tooling (views / engagement / interest) — no views tracking data
  exists in the database yet.
- Frontend rendering changes — the existing STU-24 chat UI already consumes the
  `AssistantReply` block contract (only the service layer is wired).
- Mobile-native chat UX.
- Fine-tuning / prompt versioning infrastructure beyond a maintained system
  prompt.

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-25/ai-assistant-backend-real-ai-data-grounding-chat-persistence
