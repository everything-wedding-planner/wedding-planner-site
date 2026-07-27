import { Hono } from "hono";

import { VenueModel } from "../models/venueModel";
import { VenueService } from "../services/venueService";
import { CompanyService } from "../services/companyService";
import { CompanyModel, CompanyServiceTypes } from "../models/companyModel";
import { InquiryService } from "../services/inquiryService";
import { BookingService } from "../services/bookingService";
import { toVenueResponseDTO } from "../DTO/venueDTO";
import type { AppBindings } from "../env";

export const venueRoute = new Hono<AppBindings>();

venueRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const companyService = new CompanyService(c.env.DB);
  const company = await companyService.getCompanyByUserId(userId);
  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const venueService = new VenueService(c.env.DB);
  const venues = await venueService.getVenueByCompanyId(company.id);

  if (venues instanceof Error) {
    return c.json({ error: venues.message }, 500);
  }

  const inquiryService = new InquiryService(c.env.DB);
  const bookingModel = new BookingService(c.env.DB);

  const venuesWithMetrics = await Promise.all(
    venues.map(async (venue) => {
      const [inquiryCount, bookingCount] = await Promise.all([
        inquiryService.getInquiryCountByServiceId(
          venue.id,
          CompanyServiceTypes.venue,
        ),
        bookingModel.getBookingCountByServiceId(
          venue.id,
          CompanyServiceTypes.venue,
        ),
      ]);
      return {
        ...venue,
        inquiry_count: inquiryCount,
        booking_count: bookingCount,
      };
    }),
  );

  return c.json({ venues: venuesWithMetrics });
});

venueRoute.post("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const companyModel = new CompanyModel(c.env.DB);
  const company = await companyModel.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const { name, address, capacity, contact_name, email, phone } =
    await c.req.json();

  const venueModel = new VenueModel(c.env.DB);
  const result = await venueModel.createVenue(
    company.id,
    name,
    address,
    capacity,
    contact_name,
    email,
    phone,
  );

  if (result instanceof Error) {
    return c.json({ error: result.message }, 500);
  }

  if (!result) {
    return c.json({ error: "Failed to create venue" }, 500);
  }

  const dto = await toVenueResponseDTO(result, c.env.DB);
  return c.json(
    { venue: { ...dto, id: result.id, inquiry_count: 0, booking_count: 0 } },
    201,
  );
});

venueRoute.put("/:id", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const companyService = new CompanyService(c.env.DB);
  const company = await companyService.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const id = Number(c.req.param("id"));
  const { name, address, capacity, contact_name, email, phone } =
    await c.req.json();

  const venueService = new VenueService(c.env.DB);
  const venue = await venueService.getVenueById(id);

  if (venue instanceof Error) {
    return c.json({ error: venue.message }, 500);
  }

  if (!venue) {
    return c.json({ error: "Venue not found or access denied" }, 404);
  }

  const success = await venueService.updateVenue(
    id,
    name,
    address,
    capacity,
    contact_name,
    email,
    phone,
  );

  if (!success) {
    return c.json({ error: "Failed to update venue" }, 500);
  }

  return c.json({ success: true });
});

venueRoute.get("/:id/metrics", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const companyModel = new CompanyModel(c.env.DB);
  const company = await companyModel.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const id = Number(c.req.param("id"));

  const venueModel = new VenueModel(c.env.DB);
  const venue = await venueModel.getVenueById(id);

  if (!venue || venue.company_id !== company.id) {
    return c.json({ error: "Venue not found or access denied" }, 404);
  }

  const inquiryModel = new InquiryModel(c.env.DB);
  const bookingModel = new BookingModel(c.env.DB);

  const [inquiryCount, bookingCount] = await Promise.all([
    inquiryModel.countInquiriesByServiceId(id, CompanyServiceTypes.venue),
    bookingModel.countBookingsByServiceId(id, CompanyServiceTypes.venue),
  ]);

  return c.json({ inquiry_count: inquiryCount, booking_count: bookingCount });
});
