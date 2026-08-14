import { BookingService } from "../services/bookingService";
import type { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";

export const createBookingTool = (db: D1Database) => ({
  description: "Grab all the booking information for a given company ID.",
  inputSchema: z.object({ company_id: z.number() }),
  execute: async ({ company_id }) => {
    const bookings = await new BookingService(db).getAllBookingsByUserId(
      company_id,
    );
    return JSON.stringify(
      bookings instanceof Error ? { error: bookings.message } : bookings,
    );
  },
});
