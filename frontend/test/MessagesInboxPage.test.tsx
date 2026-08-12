import { render } from "vitest-browser-react";
import { expect, test, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { DashboardDataProvider } from "../src/components/DashboardDataProvider";
import { AuthProvider } from "../src/AuthProvider";
import MessagesInboxPage from "../src/views/MessagesInboxPage";

const conversations = [
  {
    id: 1,
    client: { id: 10, username: "jane" },
    inquiry: 7,
    reference_object: { id: 3, name: "Photo Co" },
    messages: [
      {
        id: 11,
        conversation_id: 1,
        sender_id: 10,
        content: "Are you free in June?",
        read_at: null,
        created_at: "2026-01-01T10:00:00.000Z",
      },
    ],
    status: "active",
    created_at: "2026-01-01T09:00:00.000Z",
    updated_at: "2026-01-01T10:00:00.000Z",
  },
];

function stubFetch(handler: (url: string, init?: RequestInit) => Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => handler(url, init)),
  );
}

beforeEach(() => {
  stubFetch((url) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/me") {
      return new Response(JSON.stringify({ id: 1, user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path.startsWith("/api/dashboard")) {
      return new Response(
        JSON.stringify({
          data: {
            company: { id: 1, name: "Test Co" },
            vendors: [{ id: 3, name: "Photo Co" }],
            venues: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (path.startsWith("/api/conversations/reference/vendor/3")) {
      return new Response(JSON.stringify(conversations), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path.startsWith("/api/conversations/1/messages")) {
      return new Response(JSON.stringify({ messages: conversations[0].messages }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderInbox(initialPath = "/") {
  return render(
    <AuthProvider>
      <DashboardDataProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <MessagesInboxPage />
        </MemoryRouter>
      </DashboardDataProvider>
    </AuthProvider>,
  );
}

test("shows empty-state message when no reference is selected", async () => {
  const screen = await renderInbox("/");
  await expect
    .element(screen.getByText("Select a vendor or venue"))
    .toBeInTheDocument();
});

test("renders conversations for the selected reference", async () => {
  const screen = await renderInbox("/?ref_type=vendor&ref_id=3");

  await expect.element(screen.getByText("jane")).toBeInTheDocument();
  await expect
    .element(screen.getByText("Are you free in June?"))
    .toBeInTheDocument();
});
