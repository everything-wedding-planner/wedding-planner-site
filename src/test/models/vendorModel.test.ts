import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { VendorModel } from "../../models/vendorModel";
import { seedUser, seedCompany } from "../helpers";

describe("VendorModel", () => {
  it("getAllVendors — returns empty array initially", async () => {
    const model = new VendorModel(env.DB);
    const vendors = await model.getAllVendors();
    expect(vendors).toEqual([]);
  });

  it("getVendorById — returns null for invalid ID", async () => {
    const model = new VendorModel(env.DB);
    const vendor = await model.getVendorById(99999);
    expect(vendor).toBeNull();
  });

  it("createVendor — creates and returns row", async () => {
    const model = new VendorModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    const vendor = await model.createVendor(
      company.id,
      "Photo Studio",
      "photography",
      "555-2001",
      "photo@studio.com",
      "Alice Photo",
    );
    expect(vendor).not.toBeNull();
    expect(vendor!.name).toBe("Photo Studio");
    expect(vendor!.company_id).toBe(company.id);
    expect(vendor!.service_type).toBe("photography");
  });

  it("getVendorById — returns vendor for valid ID", async () => {
    const model = new VendorModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);
    const created = await model.createVendor(
      company.id,
      "Floral Design",
      "florist",
      "555-2002",
      "floral@design.com",
      "Bob Florist",
    );

    const found = await model.getVendorById(created!.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Floral Design");
    expect(found!.service_type).toBe("florist");
  });

  it("getVendorByCompanyId — returns vendors for company", async () => {
    const model = new VendorModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    await model.createVendor(
      company.id,
      "Vendor A",
      "photography",
      "555-2003",
      "a@vendor.com",
      "Contact A",
    );
    await model.createVendor(
      company.id,
      "Vendor B",
      "florist",
      "555-2004",
      "b@vendor.com",
      "Contact B",
    );

    const vendors = await model.getVendorByCompanyId(company.id);
    expect(vendors).toHaveLength(2);
    expect(vendors.map((v) => v.name)).toContain("Vendor A");
    expect(vendors.map((v) => v.name)).toContain("Vendor B");
  });

  it("getVendorByCompanyId — returns empty array for company with no vendors", async () => {
    const model = new VendorModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    const vendors = await model.getVendorByCompanyId(company.id);
    expect(vendors).toEqual([]);
  });
});
