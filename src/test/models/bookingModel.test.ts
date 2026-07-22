import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { BookingModel, BookingStatus } from "../../models/bookingModel";

describe("BookingModel", () => {
  it("getAllBookingsByCompanyId — returns null for company with no bookings", async () => {
    const model = new BookingModel(env.DB);
    const result = await model.getAllBookingsByCompanyId(99999);
    expect(result).toBeNull();
  });

  it("getAllBookingsByServiceId — returns null for service with no bookings", async () => {
    const model = new BookingModel(env.DB);
    const result = await model.getAllBookingsByServiceId(
      99999,
      "VENDOR" as "VENDOR" | "VENUE",
    );
    expect(result).toBeNull();
  });

  // KNOWN BUG: createBooking INSERT has 7 columns (client_id, service_type,
  // service_id, event_date, status, created_at, updated_at) but the bookings
  // table requires company_id (NOT NULL). The companyId parameter is accepted
  // by the method but never used in the INSERT statement, causing the INSERT
  // to fail due to the NOT NULL constraint on company_id.
  it("createBooking — documents bug: missing company_id in INSERT causes failure", async () => {
    const model = new BookingModel(env.DB);
    const result = await model.createBooking(
      1, // clientId
      1, // companyId (accepted but not used in INSERT)
      "VENDOR" as "VENDOR" | "VENUE",
      1, // serviceId
      new Date("2026-12-01"),
    );
    // The INSERT fails because company_id is NOT NULL but not included
    expect(result).toBe(false);
  });

  it("getBookingsByClientId — returns null for client with no bookings", async () => {
    const model = new BookingModel(env.DB);
    const result = await model.getBookingsByClientId(99999);
    expect(result).toBeNull();
  });

  it("updateBookingStatus — documents bug: cannot update non-existent booking", async () => {
    const model = new BookingModel(env.DB);
    // Since createBooking is broken, we test updateBookingStatus with a
    // non-existent booking ID. It returns true because the UPDATE succeeds
    // (0 rows affected is still success in D1).
    const result = await model.updateBookingStatus(
      99999,
      BookingStatus.accepted,
    );
    expect(result).toBe(true);
  });
});
