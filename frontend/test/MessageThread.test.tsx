import { render } from "vitest-browser-react";
import { expect, test, vi, beforeEach, afterEach } from "vitest";
import MessageThread from "../src/components/MessageThread";
import { AuthProvider } from "../src/AuthProvider";

const messages = [
  {
    id: 1,
    conversation_id: 5,
    sender_id: 1,
    content: "Hi Jane, we are available in June.",
    read_at: "2026-01-01T10:00:00.000Z",
    created_at: "2026-01-01T10:00:00.000Z",
  },
  {
    id: 2,
    conversation_id: 5,
    sender_id: 2,
    content: "Great, let us book.",
    read_at: null,
    created_at: "2026-01-01T10:05:00.000Z",
  },
];

function stubFetch(handler: (url: string, init?: RequestInit) => Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => handler(url, init)),
  );
}

function renderWithAuth(node: React.ReactNode) {
  return render(<AuthProvider>{node}</AuthProvider>);
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
    if (path.startsWith("/api/conversations/5/messages")) {
      return new Response(JSON.stringify({ messages }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path.startsWith("/api/messages")) {
      return new Response(JSON.stringify({ success: true }), {
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

test("renders messages from both senders", async () => {
  const screen = await renderWithAuth(
    <MessageThread conversationId={5} clientName="Jane" />,
  );

  await expect
    .element(screen.getByText("Hi Jane, we are available in June."))
    .toBeInTheDocument();
  await expect
    .element(screen.getByText("Great, let us book."))
    .toBeInTheDocument();
});

test("renders empty state when there are no messages", async () => {
  stubFetch((url) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path === "/api/me") {
      return new Response(JSON.stringify({ id: 1, user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path.startsWith("/api/conversations/5/messages")) {
      return new Response(JSON.stringify({ messages: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
    });
  });

  const screen = await renderWithAuth(<MessageThread conversationId={5} />);

  await expect
    .element(screen.getByText(/no messages yet/i))
    .toBeInTheDocument();
});

test("marks the newest unread other-party message as read", async () => {
  const fetchMock = vi.fn(
    async (url: string, init?: RequestInit) => {
      const path = new URL(url, "http://localhost").pathname;
      if (path === "/api/me") {
        return new Response(JSON.stringify({ id: 1, user: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (path.startsWith("/api/conversations/5/messages")) {
        return new Response(JSON.stringify({ messages }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (path.startsWith("/api/messages/2/read")) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
      });
    },
  );
  vi.stubGlobal("fetch", fetchMock);

  await renderWithAuth(
    <MessageThread conversationId={5} clientName="Jane" />,
  );

  await vi.waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/messages/2/read"),
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
