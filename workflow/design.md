# STU-24 Design Spec: AI Assistant Chat Panel

## Design Language

Follows the existing dashboard design system (Tailwind v4 + CSS tokens in `frontend/src/index.css`). No new color palette or font families. The assistant is visually distinct from regular chat (rose accent, subtle "AI" badge) while staying on-brand.

## Layout

- **Launcher** — fixed floating button on the right edge of the viewport, vertically centered. Sits above page content (z-index above content, below nothing else critical). Circular, rose-600, white sparkle icon (`Sparkles`). 48×48px.
- **Panel** — fixed drawer anchored to the right edge, full viewport height, `z-50` (matches `MobileSidebar`). Slides in/out horizontally via CSS transform + transition.
  - Width: `w-96` (384px) on desktop, `w-[90vw]` capped at 384px on mobile.
  - Full height: `h-dvh` with flex column: header / scrollable message list / suggestion chips / compose.
- **Position** — `fixed top-0 right-0 h-dvh` inside `DashboardLayout` (and visible across all dashboard routes via the provider + launcher).

## Colors

| Element | Value | Token |
|---|---|---|
| Launcher bg | rose-600 `#e11d48` | `--color-primary` |
| Launcher hover | rose-700 `#be123c` | `--color-primary-hover` |
| Panel bg | white `#ffffff` | `--color-surface` |
| Panel border | stone-200 `#e7e5e4` | `--color-border` |
| Header bg | stone-50 `#fafaf9` | `--color-background` |
| User bubble bg | rose-600 `#e11d48` | `--color-primary` |
| User bubble text | white | — |
| Assistant bubble bg | white `#ffffff` | `--color-surface` |
| Assistant bubble border | stone-200 `#e7e5e4` | `--color-border` |
| Assistant bubble text | stone-900 `#1c1917` | `--color-text` |
| Timestamp text | stone-400 `#a8a29e` | `--color-text-light` |
| Chip border/hover | stone-200 / stone-100 bg | `--color-border` / `--color-bg-subtle` |
| Chip active (on click) | rose-50 bg, rose-700 text | `--color-primary-light` / `--color-primary-hover` |
| "Mock" badge | amber-100 bg, amber-800 text | (new, inline only) |
| Divider | stone-200 | `--color-border` |
| Focus ring | rose-500 `#f43f5e` | `--color-primary-focus` |

## Typography

- Panel title: `text-sm font-semibold text-stone-900` — "Assistant"
- Status/subtitle under title: `text-xs text-stone-500`
- Suggestion chips: `text-xs font-medium text-stone-600`
- Message text: `text-sm` (matches existing bubbles)
- Assistant reply structure: user message bold headings, bullets as `•` lists, small `text-xs` divider/labels — rendered from a lightweight reply renderer (headings/bullets/paragraphs only)
- Timestamps: `text-[10px] text-stone-400` (matches `MessageBubble`)

## Spacing & Radius

- Panel padding: header `p-4`, message list `px-4 py-3`, compose `p-4`
- Gaps: message stack `space-y-3`; suggestion chips `flex flex-wrap gap-2`
- Bubbles: same shape as `MessageBubble` — `rounded-2xl` with a corner pulled to `rounded-br-sm` (user) / `rounded-bl-sm` (assistant), `px-3 py-1.5`, max width `max-w-[85%]`
- Launcher: `rounded-full`
- Chips: `rounded-full px-3 py-1.5 border`
- Panel corners: square (edge-to-edge drawer), `border-l border-stone-200`
- Focus states: `focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1`

## Shadows

- Panel: `shadow-2xl` (left-edge shadow reads as elevated drawer)
- Launcher: `shadow-md hover:shadow-lg transition-shadow`
- User/assistant bubbles: none (flat, matches existing app)

## Motion

- Panel open: `transform translate-x-0`; closed: `translate-x-full`. `transition-transform duration-300 ease-out`. `aria-hidden` / `inert` when closed so it's removed from tab order.
- Backdrop: none (drawer style, not modal — page remains interactive behind).
- Typing indicator: 3 dots, staggered `animate-bounce` (custom `@keyframes`), `text-stone-400`.
- Launcher: subtle `transition-transform` on hover (scale 1.05); `hidden`/`scale-0` fade-out while panel is open (panel replaces it).
- Respect `prefers-reduced-motion`: disable slide/typing animations (`motion-reduce:transition-none` / CSS media query).

## Components & States

1. **`AssistantLauncher`**
   - Default: rose-600 circle, white `Sparkles` icon, `aria-label="Open AI assistant"`, tooltip via `title`.
   - While panel open: hidden (fade + scale out).
   - Disabled/loading: not applicable (always available).

2. **`AssistantPanel`**
   - Header: sticky top, stone-50 bg, bottom border. Contains title + "AI (mock)" status badge, and a close button (`X`, `aria-label="Close AI assistant"`).
   - Body: scrollable `overflow-y-auto` message list (`aria-live="polite"` region for new messages).
   - Empty state: centered icon (`Bot`), "How can I help you today?" headline, 3 bullet hints for the use cases. Shown before first message.
   - Suggestion chips: only shown in empty state (or when last message is from the assistant) — click sends the prompt.
   - Compose: auto-sizing textarea (min 36px, max 80px — reuse `MessageCompose` behavior), Enter to send / Shift+Enter newline, send button rose-600 `Send` icon. Disabled while `isTyping`.
   - Typing indicator: assistant-side pseudo-bubble with 3 bouncing dots.

3. **Message model** (in `AssistantProvider`)
   - `ChatMessage { id: string; role: "user" | "assistant"; content: string; createdAt: string }`
   - `AssistantReply` from the response layer renders via `AssistantMessageBubble` with simple structured markup.

## Accessibility

- Launcher and close button are real `<button>`s with `aria-label`.
- Panel uses `role="dialog" aria-modal="false"` + `aria-label="AI assistant"` (non-modal drawer).
- Focus moves into panel on open; returns to launcher on close. Tab stays within panel while open (`focus-trap`-lite via `inert` on siblings not required since drawer is non-modal, but keep Escape handling).
- `Escape` closes the panel.
- Message list announced politely (`aria-live="polite"`); typing state announced via `aria-busy` on the list.
- Color contrast meets AA for all text (stone-600+ on white, white on rose-600).

## Responsive Behavior

- Mobile (< md): full-width drawer `w-[90vw] max-w-[384px]`, launcher stays 48px at right edge above the bottom nav bar (bottom `20` to clear `MobileSidebar`).
- Desktop (≥ md): `w-96`, launcher vertically centered.
- Page content behind remains interactive (drawer, not modal).

## What This Spec Does NOT Cover

- Backend/AI visuals (streaming, model names, avatars)
- DB persistence states
- Real data visuals (charts, live numbers in replies)
