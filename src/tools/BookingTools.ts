import { BookingService } from "../services/bookingService";
import type { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";

export const createGetCompanyBookingTool = (db: D1Database) => ({
  description: "Grab all the booking information for a given company ID.",
  inputSchema: z.object({ company_id: z.number() }),
  execute: async ({ company_id }) => {
    const bookings = await new BookingService(db).getAllBookingsByCompanyId(
      company_id,
    );
    return JSON.stringify(
      bookings instanceof Error ? { error: bookings.message } : bookings,
    );
  },
});

export const createGetBookingForServiceTool = (db: D1Database) => ({
  description:
    'Grab all the booking information for a given service ID and service type (If the id is vendor specific the type is "VENDOR" and if it is venue specific the type is "VENUE")',
  inputSchema: z.object({ service_id: z.number(), service_type: z.string() }),
  execute: async ({ service_id, service_type }) => {
    const bookings = await new BookingService(db).getBookingsByServiceId(
      service_id,
      service_type,
    );
    return JSON.stringify(
      bookings instanceof Error ? { error: bookings.message } : bookings,
    );
  },
});
