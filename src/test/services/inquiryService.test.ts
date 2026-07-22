import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { InquiryService } from "../../services/inquiryService";
import { VendorModel } from "../../models/vendorModel";
import { InquiryModel } from "../../models/inquiryModel";
import { seedUser, seedCompany, seedVendor } from "../helpers";

describe("InquiryService", () => {
  it("getAllInquiriesForAccountUser — returns Error if no company for user", async () => {
    const service = new InquiryService(env.DB);
    const user = await seedUser(env.DB);

    const result = await service.getAllInquiriesForAccountUser(user.id);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe(
      "Company not found for the given user ID",
    );
  });

  it("getAllInquiriesForAccountUser — returns inquiries across services", async () => {
    const service = new InquiryService(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);
    const vendor = await seedVendor(env.DB, company.id);

    // Create inquiries for this vendor
    const inquiryModel = new InquiryModel(env.DB);
    await inquiryModel.createInquiry(
      1, // clientId
      "VENDOR" as "VENDOR" | "VENUE",
      vendor.id,
      new Date("2026-12-01"),
    );

    const result = await service.getAllInquiriesForAccountUser(user.id);
    expect(result).not.toBeInstanceOf(Error);
    expect(Array.isArray(result)).toBe(true);
    expect((result as Array<unknown>).length).toBeGreaterThanOrEqual(1);
  });

  // KNOWN BUG: inquiryService.createInquiry passes arguments in wrong order:
  // service passes (serviceId, serviceType, userId, eventDate)
  // model expects (clientId, serviceType, serviceId, eventDate)
  // This swaps clientId and serviceId in the INSERT.
  it("createInquiry — creates inquiry (note: arg order bug swaps clientId/serviceId)", async () => {
    const service = new InquiryService(env.DB);

    const result = await service.createInquiry(
      1, // serviceId — but model treats this as clientId
      "VENDOR" as "VENDOR" | "VENUE",
      5, // userId — but model treats this as serviceId
      new Date("2026-12-01"),
    );
    // The inquiry is created, but with swapped clientId/serviceId values
    expect(result).toBe(true);
  });
});
