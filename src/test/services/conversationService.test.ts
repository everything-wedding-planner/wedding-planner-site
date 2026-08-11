import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { ConversationService } from "../../services/Communication/conversationService";
import {
  seedUser,
  seedCompany,
  seedVendor,
  seedVenue,
  seedInquiry,
  seedConversation,
} from "../helpers";

describe("ConversationService", () => {
  it("userCanAccessConversation — returns true for the conversation client", async () => {
    const client = await seedUser(env.DB);
    const owner = await seedUser(env.DB);
    const company = await seedCompany(env.DB, owner.id);
    const vendor = await seedVendor(env.DB, company.id);
    const inquiry = await seedInquiry(env.DB, {
      service_id: vendor.id,
      service_type: "VENDOR",
      client_id: client.id,
    });
    const conversation = await seedConversation(env.DB, {
      inquiry_id: inquiry.id,
      client_id: client.id,
      reference_id: vendor.id,
      reference_type: "vendor",
    });

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessConversation(
      client.id,
      await service.getConversationRow(conversation.id),
    );
    expect(canAccess).toBe(true);
  });

  it("userCanAccessConversation — returns true for a user of the company owning the vendor reference", async () => {
    const client = await seedUser(env.DB);
    const owner = await seedUser(env.DB);
    const company = await seedCompany(env.DB, owner.id);
    const vendor = await seedVendor(env.DB, company.id);
    const inquiry = await seedInquiry(env.DB, {
      service_id: vendor.id,
      service_type: "VENDOR",
      client_id: client.id,
    });
    const conversation = await seedConversation(env.DB, {
      inquiry_id: inquiry.id,
      client_id: client.id,
      reference_id: vendor.id,
      reference_type: "vendor",
    });

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessConversation(
      owner.id,
      await service.getConversationRow(conversation.id),
    );
    expect(canAccess).toBe(true);
  });

  it("userCanAccessConversation — returns true for a user of the company owning the venue reference", async () => {
    const client = await seedUser(env.DB);
    const owner = await seedUser(env.DB);
    const company = await seedCompany(env.DB, owner.id);
    const venue = await seedVenue(env.DB, company.id);
    const inquiry = await seedInquiry(env.DB, {
      service_id: venue.id,
      service_type: "VENUE",
      client_id: client.id,
    });
    const conversation = await seedConversation(env.DB, {
      inquiry_id: inquiry.id,
      client_id: client.id,
      reference_id: venue.id,
      reference_type: "venue",
    });

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessConversation(
      owner.id,
      await service.getConversationRow(conversation.id),
    );
    expect(canAccess).toBe(true);
  });

  it("userCanAccessConversation — returns false for an unrelated user", async () => {
    const client = await seedUser(env.DB);
    const owner = await seedUser(env.DB);
    const stranger = await seedUser(env.DB);
    const company = await seedCompany(env.DB, owner.id);
    const vendor = await seedVendor(env.DB, company.id);
    const inquiry = await seedInquiry(env.DB, {
      service_id: vendor.id,
      service_type: "VENDOR",
      client_id: client.id,
    });
    const conversation = await seedConversation(env.DB, {
      inquiry_id: inquiry.id,
      client_id: client.id,
      reference_id: vendor.id,
      reference_type: "vendor",
    });

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessConversation(
      stranger.id,
      await service.getConversationRow(conversation.id),
    );
    expect(canAccess).toBe(false);
  });

  it("userCanAccessConversation — returns false when conversation is null", async () => {
    const user = await seedUser(env.DB);
    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessConversation(user.id, null);
    expect(canAccess).toBe(false);
  });

  it("userCanAccessReference — returns true for the company owning the vendor", async () => {
    const owner = await seedUser(env.DB);
    const company = await seedCompany(env.DB, owner.id);
    const vendor = await seedVendor(env.DB, company.id);

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessReference(
      owner.id,
      vendor.id,
      "vendor",
    );
    expect(canAccess).toBe(true);
  });

  it("userCanAccessReference — returns false for a user without a company", async () => {
    const stranger = await seedUser(env.DB);

    const service = new ConversationService(env.DB);
    const canAccess = await service.userCanAccessReference(
      stranger.id,
      1,
      "vendor",
    );
    expect(canAccess).toBe(false);
  });
});
