import { Hono } from "hono";
import { CompanyModel } from "../models/companyModel";
import { CompanyService } from "../services/companyService";
import { VenueService } from "../services/venueService";
import { VendorService } from "../services/vendorService";
import type { AppBindings } from "../env";

export const companyRoute = new Hono<AppBindings>();

companyRoute.get("/", async (c) => {
  let companyModel = new CompanyModel(c.env.DB);

  const companies = await companyModel.getAllCompanies();
  return c.json({ companies });
});

companyRoute.get("/:id", async (c) => {
  const companyId = Number(c.req.param("id"));
  const session = c.get("session");
  let userId = session.get("userId");

  if (isNaN(companyId) || userId === undefined) {
    return c.json({ error: "Company ID and user ID are required" }, 400);
  }

  const companyService = new CompanyService(c.env.DB);
  const company = await companyService.getUsersCompany(userId, companyId);
  if (company instanceof Error) {
    return c.json({ error: company.message }, 400);
  }

  const venueService = new VenueService(c.env.DB);
  let venues = await venueService.getVenueByCompanyId(companyId);

  if (venues instanceof Error) {
    venues = [];
  }

  const vendorService = new VendorService(c.env.DB);
  let vendors = await vendorService.getVendorByCompanyId(companyId);
  if (vendors instanceof Error) {
    vendors = [];
  }

  return c.json({ company, venues, vendors });
});

companyRoute.put("/:id", async (c) => {
  const companyId = Number(c.req.param("id"));
  const { name, email, phone, address } = await c.req.json();

  if (isNaN(companyId)) {
    return c.json({ error: "Company ID is required" }, 400);
  }

  const companyService = new CompanyService(c.env.DB);
  const updatedCompany = await companyService.updateCompany(
    companyId,
    name,
    email,
    phone,
    address,
  );

  if (updatedCompany instanceof Error) {
    return c.json({ error: updatedCompany.message }, 400);
  }

  return c.json({ success: true });
});

companyRoute.post("/create", async (c) => {
  const session = c.get("session");
  let userId = session.get("userId");

  const { name, email, phone, address } = await c.req.json();

  let companyModel = new CompanyModel(c.env.DB);

  const company = await companyModel.createCompany(
    userId,
    name,
    email,
    phone,
    address,
  );
  return c.json({ company });
});
