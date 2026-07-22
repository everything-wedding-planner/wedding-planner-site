import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { InquiryModel, InquiryStatus } from "../../models/inquiryModel";

describe("InquiryModel", () => {
  it("getAllInquiriesByServiceId — returns null for service with no inquiries", async () => {
    const model = new InquiryModel(env.DB);
    const result = await model.getAllInquiriesByServiceId(
      99999,
      "VENDOR" as "VENDOR" | "VENUE",
    );
    expect(result).toBeNull();
  });

  it("createInquiry — creates and returns true", async () => {
    const model = new InquiryModel(env.DB);
    const result = await model.createInquiry(
      1, // clientId
      "VENDOR" as "VENDOR" | "VENUE",
      1, // serviceId
      new Date("2026-12-01"),
    );
    expect(result).toBe(true);
  });

  it("getAllInquiriesByServiceId — returns inquiries for service", async () => {
    const model = new InquiryModel(env.DB);

    // Create two inquiries for the same service
    await model.createInquiry(
      1,
      "VENDOR" as "VENDOR" | "VENUE",
      10,
      new Date("2026-12-01"),
    );
    await model.createInquiry(
      2,
      "VENDOR" as "VENDOR" | "VENUE",
      10,
      new Date("2026-12-15"),
    );

    const inquiries = await model.getAllInquiriesByServiceId(
      10,
      "VENDOR" as "VENDOR" | "VENUE",
    );
    expect(inquiries).not.toBeNull();
    expect(inquiries).toHaveLength(2);
  });

  it("getInquiriesByClientId — returns inquiries for client", async () => {
    const model = new InquiryModel(env.DB);

    // Create inquiries for client 5
    await model.createInquiry(
      5,
      "VENDOR" as "VENDOR" | "VENUE",
      20,
      new Date("2026-11-01"),
    );
    await model.createInquiry(
      5,
      "VENUE" as "VENDOR" | "VENUE",
      30,
      new Date("2026-11-15"),
    );

    const inquiries = await model.getInquiriesByClientId(5);
    expect(inquiries).not.toBeNull();
    expect(inquiries).toHaveLength(2);
  });

  it("getInquiriesByClientId — returns null for client with no inquiries", async () => {
    const model = new InquiryModel(env.DB);
    const result = await model.getInquiriesByClientId(99999);
    expect(result).toBeNull();
  });

  it("updateInquiryStatus — changes status", async () => {
    const model = new InquiryModel(env.DB);

    // Create an inquiry
    await model.createInquiry(
      1,
      "VENDOR" as "VENDOR" | "VENUE",
      40,
      new Date("2026-10-01"),
    );

    // Get the inquiry we just created (service_id=40, client_id=1)
    const inquiries = await model.getAllInquiriesByServiceId(
      40,
      "VENDOR" as "VENDOR" | "VENUE",
    );
    expect(inquiries).not.toBeNull();
    expect(inquiries).toHaveLength(1);

    const inquiryId = inquiries![0].id;

    // Update the status
    const updated = await model.updateInquiryStatus(
      inquiryId,
      InquiryStatus.accepted,
    );
    expect(updated).toBe(true);

    // Verify the status was updated
    const updatedInquiries = await model.getAllInquiriesByServiceId(
      40,
      "VENDOR" as "VENDOR" | "VENUE",
    );
    expect(updatedInquiries).not.toBeNull();
    expect(updatedInquiries![0].status).toBe("ACCEPTED");
  });
});
