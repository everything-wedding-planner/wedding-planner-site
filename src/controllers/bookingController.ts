import { Hono } from "hono";

import { BookingService } from "../services/bookingService";
import { AppBindings } from "../env";
import { BookingStatus } from "../models/bookingModel";

export const bookingRoute = new Hono<AppBindings>();

bookingRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

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

bookingRoute.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const { status } = await c.req.json();

  if (!id || !status) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  // Validate the status value
  if (!Object.values(BookingStatus).includes(status)) {
    return c.json({ error: "Invalid status value" }, 400);
  }

  const bookingService = new BookingService(c.env.DB);
  const result = await bookingService.updateBookingStatus(id, status);

  if (result) {
    return c.json({ success: true });
  }

  return c.json({ error: "Failed to update booking status" }, 500);
});
