import { createBookingTool } from "./BookingTools";

export const tools = (db: any) => ({
  get_bookings: createBookingTool(db),
});
