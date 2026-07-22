import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { CompanyModel } from "../../models/companyModel";
import { seedUser } from "../helpers";

describe("CompanyModel", () => {
  it("getAllCompanies — returns empty array initially", async () => {
    const model = new CompanyModel(env.DB);
    const companies = await model.getAllCompanies();
    expect(companies).toEqual([]);
  });

  it("getCompanyById — returns null for invalid ID", async () => {
    const model = new CompanyModel(env.DB);
    const company = await model.getCompanyById(99999);
    expect(company).toBeNull();
  });

  it("getCompanyByUserId — returns null for user with no company", async () => {
    const model = new CompanyModel(env.DB);
    // testvendor1 (id=1) has no company seeded
    const company = await model.getCompanyByUserId(1);
    expect(company).toBeNull();
  });

  it("createCompany — creates and returns row", async () => {
    const model = new CompanyModel(env.DB);
    const user = await seedUser(env.DB);

    const company = await model.createCompany(
      user.id,
      "Test Co",
      "test@co.com",
      "555-0100",
      "100 Main St",
    );
    expect(company).not.toBeNull();
    expect(company).not.toBeInstanceOf(Error);
    if (company && !(company instanceof Error)) {
      expect(company.name).toBe("Test Co");
      expect(company.user_id).toBe(user.id);
      expect(company.email).toBe("test@co.com");
    }
  });

  it("getCompanyById — returns company for valid ID", async () => {
    const model = new CompanyModel(env.DB);
    const user = await seedUser(env.DB);
    const created = await model.createCompany(
      user.id,
      "Lookup Co",
      "lookup@co.com",
      "555-0101",
      "200 Main St",
    );
    expect(created).not.toBeNull();
    expect(created).not.toBeInstanceOf(Error);

    if (created && !(created instanceof Error)) {
      const found = await model.getCompanyById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Lookup Co");
    }
  });

  it("getCompanyByUserId — returns company for user", async () => {
    const model = new CompanyModel(env.DB);
    const user = await seedUser(env.DB);
    const created = await model.createCompany(
      user.id,
      "User Co",
      "user@co.com",
      "555-0102",
      "300 Main St",
    );
    expect(created).not.toBeNull();
    expect(created).not.toBeInstanceOf(Error);

    if (created && !(created instanceof Error)) {
      const found = await model.getCompanyByUserId(user.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("User Co");
    }
  });

  it("updateCompany — updates fields", async () => {
    const model = new CompanyModel(env.DB);
    const user = await seedUser(env.DB);
    const created = await model.createCompany(
      user.id,
      "Old Name",
      "old@co.com",
      "555-0103",
      "400 Main St",
    );
    expect(created).not.toBeNull();
    expect(created).not.toBeInstanceOf(Error);

    if (created && !(created instanceof Error)) {
      const updated = await model.updateCompany(
        created.id,
        "New Name",
        "new@co.com",
        "555-0104",
        "500 Main St",
      );
      expect(updated).toBe(true);

      const found = await model.getCompanyById(created.id);
      expect(found!.name).toBe("New Name");
      expect(found!.email).toBe("new@co.com");
    }
  });

  it("deleteCompany — removes row", async () => {
    const model = new CompanyModel(env.DB);
    const user = await seedUser(env.DB);
    const created = await model.createCompany(
      user.id,
      "Delete Co",
      "delete@co.com",
      "555-0105",
      "600 Main St",
    );
    expect(created).not.toBeNull();
    expect(created).not.toBeInstanceOf(Error);

    if (created && !(created instanceof Error)) {
      const deleted = await model.deleteCompany(created.id);
      expect(deleted).toBe(true);

      const found = await model.getCompanyById(created.id);
      expect(found).toBeNull();
    }
  });
});
