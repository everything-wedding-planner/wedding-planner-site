import { describe, it, expect, beforeAll } from "vitest";
import { env, SELF } from "cloudflare:test";
import { loginUser, authPost, authPut } from "../helpers";
import {
  seedCompany,
  seedVendor,
  seedInquiry,
  seedConversation,
  seedMessage,
} from "../helpers";

describe("MessageController", () => {
  let vendor: Awaited<ReturnType<typeof seedVendor>>;
  let conversation: Awaited<ReturnType<typeof seedConversation>>;
  let clientMessage: Awaited<ReturnType<typeof seedMessage>>;

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
    clientMessage = await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 3, // testclient1
      content: "Hello from the client",
    });
  });

  describe("POST /api/messages", () => {
    it("returns 401 when unauthenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation.id,
          sender_id: 1,
          content: "hi",
        }),
      });
      expect(res.status).toBe(401);
    });

    it("returns 200 for a user of the company owning the reference", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPost("/api/messages", cookie, {
        conversation_id: conversation.id,
        sender_id: 1,
        content: "Hello from the vendor",
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("returns 200 for the conversation client", async () => {
      const { cookie } = await loginUser("testclient1@example.com");
      const res = await authPost("/api/messages", cookie, {
        conversation_id: conversation.id,
        sender_id: 3,
        content: "Hello back",
      });
      expect(res.status).toBe(200);
    });

    it("returns 403 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authPost("/api/messages", cookie, {
        conversation_id: conversation.id,
        sender_id: 2,
        content: "sneaky",
      });
      expect(res.status).toBe(403);
    });

    it("returns 404 when the conversation does not exist", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPost("/api/messages", cookie, {
        conversation_id: 999999,
        sender_id: 1,
        content: "hi",
      });
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/messages/:id/read", () => {
    it("returns 200 for a participant", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPut(
        `/api/messages/${clientMessage.id}/read`,
        cookie,
        {},
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("returns 403 for an unrelated user", async () => {
      const { cookie } = await loginUser("testvenue1@example.com");
      const res = await authPut(
        `/api/messages/${clientMessage.id}/read`,
        cookie,
        {},
      );
      expect(res.status).toBe(403);
    });

    it("returns 404 for a missing message", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      const res = await authPut(`/api/messages/999999/read`, cookie, {});
      expect(res.status).toBe(404);
    });
  });
});
