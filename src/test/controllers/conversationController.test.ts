import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { loginUser, authGet, authPost, authPut } from "../helpers";
import {
  seedCompany,
  seedVendor,
  seedInquiry,
  seedConversation,
  seedMessage,
} from "../helpers";

describe("ConversationController", () => {
  let vendor: Awaited<ReturnType<typeof seedVendor>>;
  let conversation: Awaited<ReturnType<typeof seedConversation>>;

  beforeAll(async () => {
    const company = await seedCompany(env.DB, 1); // testvendor1 owns this company
    vendor = await seedVendor(env.DB, company.id);
    const inquiry = await seedInquiry(env.DB, {
      service_id: vendor.id,
      service_type: "VENDOR",
      client_id: 3, // testclient1
    });
    conversation = await seedConversation(env.DB, {
      inquiry_id: inquiry.id,
      client_id: 3,
      reference_id: vendor.id,
      reference_type: "vendor",
    });
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 3, // testclient1
      content: "Hello from the client",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1, // testvendor1
      content: "Hello from the vendor",
      created_at: "2026-02-01T00:00:00.000Z",
    });
  });

  describe("GET /api/conversations/:id", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await SELF.fetch(
        `http://localhost/api/conversations/${conversation.id}`,
      );
      expect(res.status).toBe(401);
    });

    it("returns 200 for a user of the company owning the reference", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authGet(`/api/conversations/${conversation.id}`, cookie);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(conversation.id);
      expect(data.messages).toHaveLength(2);
    });

    it("returns 200 for the conversation client", async () => {
      const { cookie } = await loginUser("testclient1@example.com");
      const res = await authGet(`/api/conversations/${conversation.id}`, cookie);
      expect(res.status).toBe(200);
    });

    it("returns 404 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authGet(`/api/conversations/${conversation.id}`, cookie);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/conversations/reference/:type/:id", () => {
    it("returns 200 with conversations for the owning user", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authGet(
        `/api/conversations/reference/vendor/${vendor.id}`,
        cookie,
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.some((c: { id: number }) => c.id === conversation.id)).toBe(
        true,
      );
    });

    it("returns 404 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authGet(
        `/api/conversations/reference/vendor/${vendor.id}`,
        cookie,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/conversations/:id/messages", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await SELF.fetch(
        `http://localhost/api/conversations/${conversation.id}/messages`,
      );
      expect(res.status).toBe(401);
    });

    it("returns all messages when no since param", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authGet(
        `/api/conversations/${conversation.id}/messages`,
        cookie,
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.messages).toHaveLength(2);
    });

    it("returns only messages after since, ascending", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authGet(
        `/api/conversations/${conversation.id}/messages?since=${encodeURIComponent("2026-01-15T00:00:00.000Z")}`,
        cookie,
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.messages).toHaveLength(1);
      expect(data.messages[0].content).toBe("Hello from the vendor");
    });

    it("returns empty list when since is after all messages", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authGet(
        `/api/conversations/${conversation.id}/messages?since=${encodeURIComponent("2099-01-01T00:00:00.000Z")}`,
        cookie,
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.messages).toHaveLength(0);
    });

    it("returns 404 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authGet(
        `/api/conversations/${conversation.id}/messages`,
        cookie,
      );
      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/conversations", () => {
    it("returns 403 when creating a conversation for another company's reference", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authPost("/api/conversations", cookie, {
        client_id: 3,
        inquiry_id: 1,
        reference_id: vendor.id,
        reference_type: "vendor",
      });
      expect(res.status).toBe(403);
    });

    it("returns 400 when inquiry_id is missing", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPost("/api/conversations", cookie, {
        client_id: 3,
        reference_id: vendor.id,
        reference_type: "vendor",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/conversations/:id/status", () => {
    it("returns 200 for a participant", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPut(
        `/api/conversations/${conversation.id}/status`,
        cookie,
        { newStatus: "closed" },
      );
      expect(res.status).toBe(200);
    });

    it("returns 403 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authPut(
        `/api/conversations/${conversation.id}/status`,
        cookie,
        { newStatus: "closed" },
      );
      expect(res.status).toBe(403);
    });
  });
});
