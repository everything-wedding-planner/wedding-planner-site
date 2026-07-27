import { Hono } from "hono";

import { VendorModel } from "../models/vendorModel";
import { VendorService } from "../services/vendorService";
import { CompanyService } from "../services/companyService";
import { CompanyModel, CompanyServiceTypes } from "../models/companyModel";
import { InquiryService } from "../services/inquiryService";
import { BookingService } from "../services/bookingService";
import { toVendorResponseDTO } from "../DTO/vendorDTO";
import type { AppBindings } from "../env";

export const vendorRoute = new Hono<AppBindings>();

vendorRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  const companyService = new CompanyService(c.env.DB);
  const company = await companyService.getCompanyByUserId(userId);
  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const vendorService = new VendorService(c.env.DB);
  const vendors = await vendorService.getVendorByCompanyId(company.id);

  if (vendors instanceof Error) {
    return c.json({ error: vendors.message }, 500);
  }

  const inquiryService = new InquiryService(c.env.DB);
  const bookingService = new BookingService(c.env.DB);

  const vendorsWithMetrics = await Promise.all(
    vendors.map(async (vendor) => {
      const [inquiryCount, bookingCount] = await Promise.all([
        inquiryService.getInquiryCountByServiceId(
          vendor.id,
          CompanyServiceTypes.vendor,
        ),
        bookingService.getBookingCountByServiceId(
          vendor.id,
          CompanyServiceTypes.vendor,
        ),
      ]);
      return {
        ...vendor,
        inquiry_count: inquiryCount,
        booking_count: bookingCount,
      };
    }),
  );

  return c.json({ vendors: vendorsWithMetrics });
});

vendorRoute.post("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  const companyModel = new CompanyModel(c.env.DB);
  const company = await companyModel.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const { name, service_type, contact_name, email, phone } = await c.req.json();

  const vendorModel = new VendorModel(c.env.DB);
  const result = await vendorModel.createVendor(
    company.id,
    name,
    service_type,
    phone,
    email,
    contact_name,
  );

  if (result instanceof Error) {
    return c.json({ error: result.message }, 500);
  }

  if (!result) {
    return c.json({ error: "Failed to create vendor" }, 500);
  }

  const dto = await toVendorResponseDTO(result, c.env.DB);
  return c.json(
    { vendor: { ...dto, id: result.id, inquiry_count: 0, booking_count: 0 } },
    201,
  );
});

vendorRoute.put("/:id", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  const companyService = new CompanyService(c.env.DB);
  const company = await companyService.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const id = Number(c.req.param("id"));
  const { name, service_type, contact_name, email, phone } = await c.req.json();

  const vendorService = new VendorService(c.env.DB);
  const vendor = await vendorService.getVendorById(id);

  if (vendor instanceof Error) {
    return c.json({ error: vendor.message }, 500);
  }

  if (!vendor) {
    return c.json({ error: "Vendor not found or access denied" }, 404);
  }

  const success = await vendorService.updateVendor(
    id,
    name,
    service_type,
    contact_name,
    email,
    phone,
  );

  if (!success) {
    return c.json({ error: "Failed to update vendor" }, 500);
  }

  return c.json({ success: true });
});

vendorRoute.get("/:id/metrics", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  const companyModel = new CompanyModel(c.env.DB);
  const company = await companyModel.getCompanyByUserId(userId);

  if (!company) {
    return c.json({ error: "Company not found" }, 404);
  }

  const id = Number(c.req.param("id"));

  const vendorModel = new VendorModel(c.env.DB);
  const vendor = await vendorModel.getVendorById(id);

  if (!vendor || vendor.company_id !== company.id) {
    return c.json({ error: "Vendor not found or access denied" }, 404);
  }

  const inquiryService = new InquiryService(c.env.DB);
  const bookingService = new BookingService(c.env.DB);

  const [inquiryCount, bookingCount] = await Promise.all([
    inquiryService.getInquiryCountByServiceId(id, CompanyServiceTypes.vendor),
    bookingService.getBookingCountByServiceId(id, CompanyServiceTypes.vendor),
  ]);

  return c.json({ inquiry_count: inquiryCount, booking_count: bookingCount });
});
