import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { VenueModel } from "../../models/venueModel";
import { seedUser, seedCompany } from "../helpers";

describe("VenueModel", () => {
  it("getAllVenues — returns empty array initially", async () => {
    const model = new VenueModel(env.DB);
    const venues = await model.getAllVenues();
    expect(venues).toEqual([]);
  });

  it("getVenueById — returns null for invalid ID", async () => {
    const model = new VenueModel(env.DB);
    const venue = await model.getVenueById(99999);
    expect(venue).toBeNull();
  });

  it("createVenue — creates and returns row", async () => {
    const model = new VenueModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    const venue = await model.createVenue(
      company.id,
      "Grand Hall",
      "100 Event Blvd",
      200,
      "Hall Contact",
      "hall@venue.com",
      "555-3001",
    );
    expect(venue).not.toBeNull();
    expect(venue).not.toBeInstanceOf(Error);
    if (venue && !(venue instanceof Error)) {
      expect(venue.name).toBe("Grand Hall");
      expect(venue.company_id).toBe(company.id);
      expect(venue.capacity).toBe(200);
    }
  });

  it("getVenueById — returns venue for valid ID", async () => {
    const model = new VenueModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);
    const created = await model.createVenue(
      company.id,
      "Garden View",
      "200 Garden Rd",
      150,
      "Garden Contact",
      "garden@venue.com",
      "555-3002",
    );
    expect(created).not.toBeNull();
    expect(created).not.toBeInstanceOf(Error);

    if (created && !(created instanceof Error)) {
      const found = await model.getVenueById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe("Garden View");
      expect(found!.capacity).toBe(150);
    }
  });

  it("getVenuesByCompanyId — returns venues for company", async () => {
    const model = new VenueModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    await model.createVenue(
      company.id,
      "Venue A",
      "100 A St",
      100,
      "Contact A",
      "a@venue.com",
      "555-3003",
    );
    await model.createVenue(
      company.id,
      "Venue B",
      "200 B St",
      200,
      "Contact B",
      "b@venue.com",
      "555-3004",
    );

    const venues = await model.getVenuesByCompanyId(company.id);
    expect(venues).toHaveLength(2);
    expect(venues.map((v) => v.name)).toContain("Venue A");
    expect(venues.map((v) => v.name)).toContain("Venue B");
  });

  it("getVenuesByCompanyId — returns empty array for company with no venues", async () => {
    const model = new VenueModel(env.DB);
    const user = await seedUser(env.DB);
    const company = await seedCompany(env.DB, user.id);

    const venues = await model.getVenuesByCompanyId(company.id);
    expect(venues).toEqual([]);
  });
});
