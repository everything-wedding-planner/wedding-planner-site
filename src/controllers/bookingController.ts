import { Hono } from "hono";

import { BookingService } from "../services/bookingService";
import { AppBindings } from "../env";

export const bookingRoute = new Hono<AppBindings>();

bookingRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  let bookingService = new BookingService(db);
  const bookings = await bookingService.getAllBookingsByUserId(userId);

  if (bookings instanceof Error) {
    return c.json({ error: bookings.message }, 404);
  }

  return c.json(bookings);
});

bookingRoute.post("/create", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  let bookingService = new BookingService(db);

  const { serviceId, serviceType, eventDate } = await c.req.json();
  const result = await bookingService.createBooking(
    userId,
    serviceType,
    serviceId,
    new Date(eventDate),
  );

  if (result instanceof Error) {
    return c.json({ error: result.message }, 500);
  }

  return c.json({ success: true }, 201);
});
