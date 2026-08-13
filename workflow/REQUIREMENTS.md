# STU-24: AI Assistant inline chat panel (design + frontend scaffolding)

## Problem

Users (vendors/venues) juggle inquiries, bookings, deadlines, and analytics inside the admin dashboard. There is no in-app assistant, so users must manually dig through pages to summarize conversations, recall upcoming deadlines, and pull data insights.

## Desired Outcome

An inline AI assistant chat panel within the logged-in dashboard layout that lets users ask questions and get answers that:

- **Summarize conversations** — condense inquiry/message threads into key points
- **Surface upcoming deadlines** — highlight booking dates, response deadlines, and follow-ups
- **Explain data insights** — translate analytics (views, engagement, interest) into plain-language takeaways

This phase delivers the **designed UI with frontend scaffolding only**: a fully interactive chat panel that responds with realistic mock responses. No backend or AI integration is included.

### UX behavior

- Panel sits as a persistent inline panel alongside the main dashboard content (does not cover content or require opening a modal)
- Collapsible/toggleable so users can hide it when not needed
- Chat history (conversation state) persists while navigating between dashboard pages
- Input field with suggested prompt chips (e.g., "Summarize my messages", "What's coming up next week?", "How are my listings performing?")
- Assistant responses render with structure (bullets/lists) for summaries and insights, plus a clear "mock" treatment so it's obvious AI isn't live yet
- Loading/typing indicator while a mock response is being generated
- Accessible: keyboard operable, proper focus management, labelled controls

### What it should NOT do (this phase)

- No real AI/LLM calls, no backend endpoint, no persistence of chat across page reloads
- No data-fetching or wiring into real analytics/inquiry data (mock data is fine)

## Scope

**In:** inline chat panel component(s), collapsible panel in the dashboard layout, mock response generator for the three use cases, suggested prompts, typing indicator, chat state preserved across route navigation, frontend tests.

**Out:** backend integration, real AI provider, persistence to DB, auth/permissions for assistant, mobile-native chat UX (panel should still behave sensibly on mobile but not be the focus).

## Linear Ticket

https://linear.app/stuart-calverley/issue/STU-24/ai-assistant-inline-chat-panel-design-frontend-scaffolding
