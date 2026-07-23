import { Hono } from "hono";

import { VendorModel } from "../models/vendorModel";
import { CompanyModel } from "../models/companyModel";
import { VenueModel } from "../models/venueModel";
import { UserModel } from "../models/Users/userModel";
import { toCompanyResponseDTO, CompanyResponseDTO } from "../DTO/companyDTO";
import { VendorService } from "../services/vendorService";
import { VenueService } from "../services/venueService";
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

  const venueService = new VenueService(c.env.DB);
  let venues = await venueService.getVenueByCompanyId(company.id);

  if (venues instanceof Error) {
    venues = [];
  }

  const vendorService = new VendorService(c.env.DB);
  let vendors = await vendorService.getVendorByCompanyId(company.id);
  if (vendors instanceof Error) {
    vendors = [];
  }

  return c.json({
    success: true,
    data: {
      user,
      company: companyResponse,
      vendors: vendors,
      venues: venues,
    },
  });
});
