import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { BookingService } from "../../services/bookingService";
import { CompanyModel } from "../../models/companyModel";
import { seedUser, seedCompany, seedVendor } from "../helpers";

describe("BookingService", () => {
  it("getAllBookingsByUserId — returns Error if no company for user", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);

    const result = await service.getAllBookingsByUserId(user.id);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("Company not found");
  });

  it("getAllBookingsByUserId — returns Error if no bookings found", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);
    const companyModel = new CompanyModel(env.DB);
    await companyModel.createCompany(
      user.id,
      "Test Co",
      "test@co.com",
      "555-0100",
      "100 Main St",
    );

    const result = await service.getAllBookingsByUserId(user.id);
    // getAllBookingsByCompanyId returns null when no bookings, so service returns Error
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe(
      "No bookings found for the given company ID",
    );
  });

  // KNOWN BUG: bookingModel.createBooking doesn't include company_id in INSERT,
  // so it always fails. This means createBooking always returns false.
  it("createBooking — documents bug: returns false because company_id missing from INSERT", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);
    const vendor = await seedVendor(env.DB, company.id);

    const result = await service.createBooking(
      user.id,
      "VENDOR" as "VENDOR" | "VENUE",
      vendor.id,
      new Date("2026-12-01"),
    );
    // Booking is false because company_id is NOT in the INSERT
    expect(result).toBe(false);
  });

  it("createBooking — returns Error for invalid service type", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);

    const result = await service.createBooking(
      user.id,
      "INVALID" as "VENDOR" | "VENUE",
      1,
      new Date("2026-12-01"),
    );
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("Invalid service type");
  });

  it("createBooking — returns Error for nonexistent vendor", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);

    const result = await service.createBooking(
      user.id,
      "VENDOR" as "VENDOR" | "VENUE",
      99999,
      new Date("2026-12-01"),
    );
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("Vendor not found");
  });

  it("createBooking — returns Error for nonexistent venue", async () => {
    const service = new BookingService(env.DB);
    const user = await seedUser(env.DB);

    const result = await service.createBooking(
      user.id,
      "VENUE" as "VENDOR" | "VENUE",
      99999,
      new Date("2026-12-01"),
    );
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("Venue not found");
  });
});
