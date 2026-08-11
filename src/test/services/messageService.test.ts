import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { MessageService } from "../../services/Communication/messageService";
import {
  seedUser,
  seedCompany,
  seedVendor,
  seedInquiry,
  seedConversation,
  seedMessage,
} from "../helpers";

async function setupConversation() {
  const user = await seedUser(env.DB);
  const company = await seedCompany(env.DB, user.id);
  const vendor = await seedVendor(env.DB, company.id);
  const inquiry = await seedInquiry(env.DB, {
    service_id: vendor.id,
    service_type: "VENDOR",
    client_id: user.id,
  });
  const conversation = await seedConversation(env.DB, {
    inquiry_id: inquiry.id,
    client_id: user.id,
    reference_id: vendor.id,
    reference_type: "vendor",
  });
  return { user, company, vendor, inquiry, conversation };
}

describe("MessageService", () => {
  it("getMessagesByConversationIdSince — returns only messages after since", async () => {
    const { conversation } = await setupConversation();
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      message_role: "client",
      content: "old",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      message_role: "client",
      content: "new",
      created_at: "2026-02-01T00:00:00.000Z",
    });

    const service = new MessageService(env.DB);
    const messages = await service.getMessagesByConversationIdSince(
      conversation.id,
      "2026-01-15T00:00:00.000Z",
    );
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("new");
  });

  it("getMessagesByConversationIdSince — DTOs carry conversation id and role", async () => {
    const { conversation } = await setupConversation();
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      message_role: "venue",
      content: "hello",
      created_at: "2026-01-01T00:00:00.000Z",
    });

    const service = new MessageService(env.DB);
    const messages = await service.getMessagesByConversationIdSince(
      conversation.id,
      "2025-01-01T00:00:00.000Z",
    );
    expect(messages).toHaveLength(1);
    expect(messages[0].conversation_id).toBe(conversation.id);
    expect(messages[0].message_role).toBe("venue");
    expect(messages[0].content).toBe("hello");
  });
});
