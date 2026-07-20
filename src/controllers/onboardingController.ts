import { Hono } from "hono";

import { VendorModel, VendorProfile } from "../models/vendorModel";
import { VenueModel, VenueProfile } from "../models/venueModel";
import { CompanyModel, CompanyProfile } from "../models/companyModel";
import bcrypt from "bcryptjs";
import type { AppBindings } from "../env";
import { UserModel } from "../models/Users/userModel";

export const onboardingRoute = new Hono<AppBindings>();

onboardingRoute.post("/submit", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { company, vendor, venue } = await c.req.json();

  if (!company) {
    return c.json({ error: "Company data is required" }, 400);
  }

  if (!vendor && !venue) {
    return c.json({ error: "No vendor or venue provided" }, 400);
  }

  const db = c.env.DB;
  const vendorModel = new VendorModel(db);
  const venueModel = new VenueModel(db);
  const companyModel = new CompanyModel(db);
  const userModel = new UserModel(db);

  const companyRow = await companyModel.createCompany(
    userId,
    company.name,
    company.email,
    company.phone,
    company.address,
  );

  if (companyRow instanceof Error || companyRow === null) {
    return c.json({ error: "Failed to create company" }, 500);
  }

  if (vendor) {
    console.log("Vendor data received:", vendor);
    const {
      businessName,
      serviceType,
      contactName,
      contactEmail,
      contactPhone,
    } = vendor as VendorProfile;

    await vendorModel.createVendor(
      companyRow.id,
      businessName,
      serviceType,
      contactPhone,
      contactEmail,
      contactName,
    );
  }

  if (venue) {
    console.log("Venue data received:", venue);
    const {
      venueName,
      address,
      capacity,
      contactName,
      contactEmail,
      contactPhone,
    } = venue as VenueProfile;

    await venueModel.createVenue(
      companyRow.id,
      venueName,
      address,
      parseInt(capacity),
      contactName,
      contactEmail,
      contactPhone,
    );
  }

  await userModel.completedOnBoarding(userId);

  return c.json({ success: true });
});
