# STU-25: AI Assistant backend — real AI, data grounding, chat persistence

## Problem

STU-24 delivered the AI assistant chat panel as frontend scaffolding with mock
responses. Users cannot yet get real answers: summarizing conversations,
surfacing upcoming deadlines, and explaining analytics currently return
hardcoded mock text with no connection to actual inquiry, booking, or analytics
data, and chat history is lost on reload.

## Desired Outcome

A real backend for the assistant. When a logged-in vendor/venue asks a question
in the chat panel:

- The backend calls a real LLM via Cloudflare Workers AI (single-shot, not
  streaming).
- The answer is grounded in that user's actual data: conversations/messages
  (summaries), bookings (upcoming deadlines), and analytics (views, engagement,
  interest).
- The reply is structured into blocks (heading / paragraph / bullets) so the
  existing chat UI can render it without frontend changes.
- Chat history is persisted in D1 so it survives page reloads and route
  navigation.

## Scope

**In:**

- Enable the Cloudflare Workers AI binding (`wrangler.jsonc` + env types).
- New `/api/assistant` routes (controller / service / model / DTO pattern):
  - Send a message → grounded, structured reply (single-shot).
  - Retrieve persisted chat history for the logged-in user.
- Real-data grounding: prompt context built from the user's conversations,
  messages, bookings, and analytics.
- D1 migration(s) for assistant chat sessions and messages.
- Protected by the existing session auth middleware (only the owner can access
  their own chat history).
- Backend tests (controller + service, mock the AI binding).

**Out (this phase):**

- Streaming responses (deferred).
- Frontend changes — the existing STU-24 chat UI already consumes the
  `AssistantReply` block contract.
- Mobile-native chat UX.
- Fine-tuning / prompt versioning infrastructure beyond a maintained system
  prompt.

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-25/ai-assistant-backend-real-ai-data-grounding-chat-persistence
