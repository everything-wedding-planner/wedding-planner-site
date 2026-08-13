# STU-25: AI Assistant backend — proposal

## Problem

STU-24 shipped the assistant chat panel as frontend scaffolding backed by a
mock service (`MockAssistantService`). "Summarize my conversations", "what's
coming up next week", and performance answers are hardcoded strings with no
connection to the user's real inquiry, booking, or conversation data. Users
cannot get real answers, and the mock fabricates names, dates, and numbers.

## Proposed Solution

A real backend for the assistant built on the existing Hono worker:

- **Cloudflare Workers AI** with **embedded function calling** via
  `@cloudflare/ai-utils` `runWithTools`, using the `@cf/zai-org/glm-4.7-flash`
  model. The tool loop (model → tool → model) is executed and bounded
  automatically by the library (`maxRecursiveToolRuns`), keeping the API
  single-shot (no streaming).
- **Read-only tools**, all scoped to the logged-in user's company services
  (user → company → vendors/venues):
  - `get_bookings(filter)` — bookings with upcoming/past filtering and status.
  - `get_inquiries(filter)` — inquiries/leads with status filtering.
  - `get_conversations()` — conversations with client, service, last-message
    preview, and unread status.
  - `get_conversation_messages(conversationId)` — full thread for a specific
    conversation.
- **Per-session conversation**: the client sends the accumulated message
  history with each request; the server is stateless and nothing is persisted.
- **Structured replies**: the model is instructed (and the output validated) to
  return the existing `AssistantReply` blocks contract (heading / paragraph /
  bullets) so the STU-24 UI renders without visual changes.
- **Minimal frontend wiring**: `assistantService.ts` posts the messages array to
  `/api/assistant` and maps the response back to `AssistantReply`.

## Key Changes

1. Enable the `AI` binding in `wrangler.jsonc` + `Env` types; add
   `@cloudflare/ai-utils` dependency.
2. New `src/controllers/assistantController.ts` (`POST /api/assistant`),
   `src/services/assistantService.ts`, `src/tools/assistantTools.ts` (tool
   schemas + implementations), and `src/DTO/assistantDTO.ts`.
3. Grounding reuses existing services/models (`BookingService`,
   `InquiryService`, `ConversationService`, `MessageService`) and their
   `userCanAccess*` / company-scoping checks.
4. Block output contract: system prompt + JSON instructions; a
   `parseAssistantReply` util validates/normalizes the model output into
   `AssistantReply`, with a plain-text fallback for casual messages.
5. Bounded, safe execution: `maxRecursiveToolRuns: 2`, `strictValidation: true`,
   `streamFinalResponse: false`; tools are read-only.
6. Requirement scope adjustments: analytics tooling **deferred** (no views /
   impressions tracking exists in the DB); REQUIREMENTS.md and STU-25 updated
   to match.
7. Backend tests: tool-execution tests against seeded D1, `parseAssistantReply`
   unit tests, and controller tests with a mocked `AI` binding.

## Success Criteria

- A logged-in vendor/venue asks "What's coming up next month?" and receives real
  upcoming bookings (correct client/service/date/status) as structured blocks.
- "Summarize my conversations" returns real summaries referencing real clients
  and conversation threads.
- Follow-ups within a session retain context (history sent per request; nothing
  persisted server-side).
- Unauthenticated requests → 401; tool data is strictly company-scoped.
- The model never invents data — it answers only from tool results, which the
  system prompt enforces.
- Backend tests pass; frontend renders replies without rendering changes.

## Out of Scope (this phase)

- Analytics / views / engagement / interest tool (no tracking data exists yet).
- Chat persistence (per-session only, by design).
- Streaming responses.
- Agentic actions (creating bookings, sending messages) — tools are read-only.
