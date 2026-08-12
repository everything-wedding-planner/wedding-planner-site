import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { MessageModel } from "../../models/Communication/messageModel";
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

describe("MessageModel", () => {
  it("getMessagesByConversationIdSince — returns only messages created after since", async () => {
    const { conversation } = await setupConversation();
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "first",
      created_at: "2026-01-01T00:00:00.000Z",
    });
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "second",
      created_at: "2026-02-01T00:00:00.000Z",
    });

    const model = new MessageModel(env.DB);
    const messages = await model.getMessagesByConversationIdSince(
      conversation.id,
      "2026-01-15T00:00:00.000Z",
    );
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe("second");
  });

  it("getMessagesByConversationIdSince — returns messages in ascending order", async () => {
    const { conversation } = await setupConversation();
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "older",
      created_at: "2026-03-01T00:00:00.000Z",
    });
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "newer",
      created_at: "2026-04-01T00:00:00.000Z",
    });

    const model = new MessageModel(env.DB);
    const messages = await model.getMessagesByConversationIdSince(
      conversation.id,
      "2026-02-01T00:00:00.000Z",
    );
    expect(messages.map((m) => m.content)).toEqual(["older", "newer"]);
  });

  it("getMessagesByConversationIdSince — returns empty when since is after all messages", async () => {
    const { conversation } = await setupConversation();
    await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "only",
      created_at: "2026-05-01T00:00:00.000Z",
    });

    const model = new MessageModel(env.DB);
    const messages = await model.getMessagesByConversationIdSince(
      conversation.id,
      "2099-01-01T00:00:00.000Z",
    );
    expect(messages).toHaveLength(0);
  });

  it("getMessageById — returns the message", async () => {
    const { conversation } = await setupConversation();
    const message = await seedMessage(env.DB, {
      conversation_id: conversation.id,
      sender_id: 1,
      content: "hello",
    });

    const model = new MessageModel(env.DB);
    const found = await model.getMessageById(message.id);
    expect(found).not.toBeNull();
    expect(found!.content).toBe("hello");
  });

  it("getMessageById — returns null for a missing message", async () => {
    const model = new MessageModel(env.DB);
    const found = await model.getMessageById(999999);
    expect(found).toBeNull();
  });
});
