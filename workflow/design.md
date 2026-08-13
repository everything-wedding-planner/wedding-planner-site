# STU-25: AI Assistant backend — design spec

## 1. Architecture Overview

```
Browser chat panel (frontend/ AssistantProvider)
   │  POST /api/assistant  { messages: [{ role, content }, ...] }
   ▼
Hono worker (src/index.ts, validUserMiddleware → 401 if unauthenticated)
   ▼
assistantController.post("/")            src/controllers/assistantController.ts
   │  validates request DTO
   ▼
assistantService.sendMessage(userId, messages)      src/services/assistantService.ts
   │  resolves company + services (for system prompt context)
   │  builds system prompt + tool definitions (closures capture db/userId)
   │  runWithTools(env.AI, MODEL, { messages, tools }, config)
   │    → bounded tool loop (maxRecursiveToolRuns: 2)
   ▼
tool functions (src/tools/assistantTools.ts)
   │  query D1 via existing services, scoped to the user's company
   ▼
parseAssistantReply(output) → AssistantReply     src/utils/assistantReply.ts
   ▼
c.json({ reply: { blocks: [...] } })
```

Key properties:

- **Stateless server**: no chat tables, no migrations, no session store. The
  client owns the conversation history.
- **Single-shot HTTP**: one request/response; no streaming
  (`streamFinalResponse: false`).
- **Read-only tools**: no mutations to bookings/inquiries/conversations.
- **Company scoping**: every tool resolves the user's company and only returns
  rows belonging to that company's vendors/venues.

## 2. API Contract

### `POST /api/assistant`

Request body:

```jsonc
{
  // Full in-session conversation including the new user message.
  // Last entry MUST be role "user".
  "messages": [
    { "role": "user", "content": "What's coming up next week?" }
  ]
}
```

Validation rules:

- `messages` is a non-empty array (max 30 entries to bound token usage).
- Each entry: `role ∈ { "user", "assistant" }`, `content` non-empty string,
  max 4000 chars.
- Last entry must be `"user"`.
- Invalid → `400 { error }`.

Response `200`:

```jsonc
{
  "reply": {
    "blocks": [
      { "type": "heading", "text": "Upcoming bookings" },
      { "type": "bullets", "items": ["Aug 22 — The Grand Hall: Anna & Tom (ACCEPTED)", "..."] }
    ]
  }
}
```

Error responses:

- `401 { error: "Unauthorized" }` — no/invalid session (existing middleware).
- `400 { error }` — malformed body.
- `502 { error }` — Workers AI call failed or returned unparseable output after
  retries/fallback.
- `500 { error }` — unexpected failure.

## 3. Configuration Changes

**`wrangler.jsonc`** — enable the AI binding (currently commented out, lines
40–42):

```jsonc
"ai": { "binding": "AI" }
```

**`src/env.ts`**:

```ts
import type { Ai } from "@cloudflare/workers-types";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  SESSION_SECRET: string;
  AI: Ai;
}
```

**`package.json`** — add dependency `@cloudflare/ai-utils` (provides
`runWithTools`).

**Model constant** — `src/config/ai.ts`:

```ts
export const ASSISTANT_MODEL = "@cf/zai-org/glm-4.7-flash";
```

## 4. File Structure

```
src/
  config/ai.ts                              Model id + runWithTools config
  controllers/assistantController.ts        POST /api/assistant
  services/assistantService.ts              Orchestrates prompt + runWithTools
  tools/assistantTools.ts                   Tool schemas + implementations
  utils/assistantReply.ts                   parseAssistantReply validation
  DTO/assistantDTO.ts                       Request/response + block types
  test/services/assistantService.test.ts
  test/services/assistantTools.test.ts
  test/utils/assistantReply.test.ts
  test/controllers/assistantController.test.ts
```

Route registration in `src/index.ts`:

```ts
app.route("/api/assistant", assistantRoute);
```

## 5. DTOs (`src/DTO/assistantDTO.ts`)

```ts
export interface AssistantChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AssistantReplyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] };

export interface AssistantReply {
  blocks: AssistantReplyBlock[];
}
```

(Mirrors `frontend/src/assistant/types.ts` so the UI can render the response
without changes.)

## 6. System Prompt

Assembled per request in `assistantService`:

- **Role**: "You are the admin assistant for a wedding vendor/venue account."
- **Account context**: company name + list of services (name, type, id) resolved
  from the user's company — the model can reference these in answers.
- **Grounding rules**:
  - Use the provided tools to fetch data. Never invent clients, dates, statuses,
    or numbers.
  - Answer strictly from tool results.
  - If a tool returns no data or an error, say so plainly.
  - For questions not answerable from the tools, stay in your role as the admin
    assistant and offer what you can help with.
- **Output contract** (included verbatim):
  - "Reply with ONLY valid JSON (no markdown fences), exactly this shape:
    `{"blocks":[{"type":"heading","text":"..."},{"type":"paragraph","text":"..."},{"type":"bullets","items":["...","..."]}]}`."
  - `heading`/`paragraph` require `text`; `bullets` require `items`.
  - 1–4 blocks; keep bullets to ~8 items; concise, friendly tone.
  - Casual messages (greetings, thanks) that need no data → a single `paragraph`
    block.

**History mapping**: client `messages` are mapped to
`{ role, content }` (assistant `blocks` are flattened to `content` text before
sending).

## 7. Tools (`src/tools/assistantTools.ts`)

Each tool is a closure `(args) => Promise<string>` (JSON string fed back to the
model by `runWithTools`). All close over `{ db, userId }`.

### `get_bookings`

- Description: "List bookings for this account's services. Use for upcoming
  bookings, deadlines, or booking status questions."
- Parameters:
  - `status?`: `"PENDING" | "ACCEPTED" | "CANCELLED" | "REJECTED"`
  - `range?`: `"upcoming" | "past" | "all"` (default `"upcoming"`)
  - `days?`: number — lookahead window in days (default 30)
- Implementation: `BookingService.getAllBookingsByUserId(userId)`; filter by
  range/status/days; map to
  `{ id, clientName, serviceName, serviceType, eventDate, status }`; cap at 25
  rows (sorted by `eventDate`); return `JSON.stringify`.

### `get_inquiries`

- Description: "List inquiries/leads for this account's services. Use for new
  leads, interest, or pending inquiry questions."
- Parameters:
  - `status?`: `"NEW" | "ACCEPTED" | "CANCELLED" | "REJECTED"`
  - `days?`: number (default 30)
- Implementation: `InquiryService.getAllInquiriesForAccountUser(userId)`;
  filter; map to
  `{ id, clientName, serviceName, serviceType, eventDate, status, createdAt }`;
  cap at 25 rows; return `JSON.stringify`.

### `get_conversations`

- Description: "List conversations for this account's services with client,
  service, latest message, and unread status."
- Parameters: none.
- Implementation: resolve company services; for each vendor/venue use
  `ConversationModel.getConversationsByReference`; for each conversation fetch
  last message + message count + unread (mirroring
  `getUnreadCompanyConversationsCount` logic); map to
  `{ id, clientName, serviceName, status, lastMessage, messageCount, unread,
     updatedAt }`; sort by `updatedAt` desc; cap at 25; return `JSON.stringify`.

### `get_conversation_messages`

- Description: "Get the full message thread for one conversation. Use to
  summarize a specific conversation."
- Parameters:
  - `conversationId`: number (required)
- Implementation: `ConversationService.getConversationRow(conversationId)`;
  enforce `userCanAccessConversation(userId, conversation)` (else return
  `{ error: "Conversation not found" }`); `MessageService.getMessagesByConversationId`;
  map to `{ id, sender, content, createdAt, read }` (sender resolved from
  `sender_id` user name); cap at 50 messages; return `JSON.stringify`.

**Scoping guard**: if the user has no company, all tools return
`{ error: "No company found for this account" }`.

## 8. Orchestration (`src/services/assistantService.ts`)

```ts
const response = await runWithTools(
  env.AI,
  ASSISTANT_MODEL,
  {
    messages: [{ role: "system", content: systemPrompt }, ...history],
    tools,
  },
  {
    maxRecursiveToolRuns: 2,
    strictValidation: true,
    verbose: false,
    streamFinalResponse: false,
  },
);
```

- `systemPrompt` built from the resolved company/services (Section 6).
- `response` is the final assistant output (string, or object with `.response`).
  Handled defensively in `parseAssistantReply`.
- Any thrown error → `AssistantError` typed for the controller (`502`).

## 9. Reply Parsing (`src/utils/assistantReply.ts`)

`parseAssistantReply(raw: unknown): AssistantReply`

1. Accept string or `{ response: string }`; strip surrounding markdown fences
   (`` ```json `` … ` ``` `) if present.
2. `JSON.parse`; if it fails → **fallback**: single `paragraph` block containing
   the raw text (truncated to 2000 chars).
3. Validate `blocks` array: keep only blocks matching the schema; drop invalid
   entries; if `heading`/`paragraph` `text` is missing/empty drop the block;
   `bullets` must have non-empty `items` array.
4. Cap: max 6 blocks, max 10 items per bullets block (truncate).
5. If zero valid blocks survive → fallback paragraph with a generic message.

Guarantees the response always matches the `AssistantReply` contract.

## 10. Frontend Wiring (minimal)

**`frontend/src/assistant/assistantService.ts`** — replace the mock:

```ts
export interface AssistantService {
  getResponse(messages: { role: "user" | "assistant"; content: string }[]):
    Promise<AssistantReply>;
}

export class ApiAssistantService implements AssistantService {
  async getResponse(messages) {
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error(`Assistant request failed: ${res.status}`);
    const data = await res.json();
    return data.reply as AssistantReply;
  }
}
```

**`frontend/src/assistant/AssistantProvider.tsx`** — `sendMessage` maps the
current `messages` state + the new user message to `{ role, content }` pairs and
passes them to `getResponse` (instead of a single string). No rendering changes.

**Frontend tests** referencing `getResponse(input)` are updated for the new
signature.

## 11. Test Strategy

All backend tests use `@cloudflare/vitest-pool-workers` (seeded D1 via
`src/test/setup.ts` + `helpers.ts`).

- **`assistantTools.test.ts`** — seed company/vendor/venue/inquiry/booking/
  conversation/message rows; call each tool function directly with the seeded
  DB:
  - company scoping (rows from another company excluded),
  - `get_bookings` upcoming/past/status filtering,
  - `get_conversations` unread + last-message correctness,
  - `get_conversation_messages` access denied for non-owners,
  - no-company user → `{ error }`.
- **`assistantReply.test.ts`** — valid JSON, fenced JSON, non-JSON fallback,
  invalid blocks filtered, block/item caps.
- **`assistantService.test.ts`** — construct the service with a **stubbed
  `AI`** binding whose `run()` is scripted (vitest `mockImplementation`): first
  returns a `tool_calls` response, then the final JSON response. Assert the
  returned `AssistantReply` shape and that tool results were fed back.
- **`assistantController.test.ts`**:
  - `401` unauthenticated (via `SELF`).
  - `400` invalid body (via `SELF`, no AI reached).
  - `200` happy path: build the route with a mocked env (`app.request(path,
    init, mockEnv)`) where `AI.run` is scripted; assert `{ reply: { blocks } }`
    shape.
  - `502` when the mocked AI throws.

The `AI` binding is never hit in tests against real Workers AI — always stubbed.

## 12. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Model returns non-JSON / malformed blocks | `parseAssistantReply` validates + falls back to paragraph |
| Model hallucinates data | System prompt grounding rules + read-only tools returning only real rows |
| Tool loop unbounded / expensive | `maxRecursiveToolRuns: 2`; capped row counts; capped message history |
| Cross-company data leak | Every tool scopes by company + `userCanAccess*` checks; covered by tests |
| Frontend sends too-large history | 30-message cap in DTO validation |
| `@cloudflare/ai-utils` / model API drift | Pin versions; keep tool schemas OpenAI-compatible; model id in one constant |

## 13. Linear Ticket

https://linear.app/stuart-calverley/issue/STU-25/ai-assistant-backend-real-ai-data-grounding-per-session-chat
