import { Hono } from "hono";

import { VenueModel } from "../models/venueModel";
import type { AppBindings } from "../env";

export const venueRoute = new Hono<AppBindings>();

venueRoute.get("/", async (c) => {
  let venueModel = new VenueModel(c.env.DB);

  const venues = await venueModel.getAllVenues();
  return c.json({ venues });
});

venueRoute.post("/create", async (c) => {
  const { name, address, capacity } = await c.req.json();

  let venueModel = new VenueModel(c.env.DB);

  const venue = await venueModel.createVenue(name, address, capacity);
  return c.json({ venue });
});
