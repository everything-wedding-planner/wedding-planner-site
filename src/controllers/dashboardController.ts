import { Hono } from "hono";

import { VendorModel } from "../models/vendorModel";
import { CompanyModel } from "../models/companyModel";
import { VenueModel } from "../models/venueModel";
import { UserModel } from "../models/Users/userModel";
import { toCompanyResponseDTO, CompanyResponseDTO } from "../DTO/companyDTO";
import { toVendorResponseDTO, VendorResponseDTO } from "../DTO/vendorDTO";
import { toVenueResponseDTO, VenueResponseDTO } from "../DTO/venueDTO";

import type { AppBindings } from "../env";

export const dashboardRoute = new Hono<AppBindings>();

dashboardRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;

  const userModel = new UserModel(db);
  const user = await userModel.findUserById(userId);

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  if (!user.completed_onboarding) {
    console.log("User has not completed onboarding");
    return c.json({ success: true }, 200);
  }

  const companyModel = new CompanyModel(db);
  const company = await companyModel.getCompanyById(userId);

  if (!company) {
    return c.json({ success: true }, 200);
  }
  const companyResponse: CompanyResponseDTO = await toCompanyResponseDTO(
    company,
    db,
  );

  const vendorModel = new VendorModel(db);
  const venueModel = new VenueModel(db);

  const vendors = await vendorModel.getVendorByCompanyId(company.id);
  let vendorResponse: VendorResponseDTO[] = [];
  if (vendors.length > 0) {
    vendorResponse = await Promise.all(
      vendors.map(async (vendor) => toVendorResponseDTO(vendor, db)),
    );
  }

  const venues = await venueModel.getVenuesByCompanyId(company.id);
  let venueResponse: VenueResponseDTO[] = [];
  if (venues.length > 0) {
    venueResponse = await Promise.all(
      venues.map(async (venue) => toVenueResponseDTO(venue, db)),
    );
  }

  return c.json({
    success: true,
    data: {
      user,
      company: companyResponse,
      vendors: vendorResponse,
      venues: venueResponse,
    },
  });
});
