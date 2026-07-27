import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("VenueController", () => {
  describe("GET /api/venues", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/venues");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/venues", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Venue",
          address: "789 Venue Rd",
          capacity: 150,
          contact_name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0199",
        }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/venues/:id", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/venues/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Venue",
          address: "789 Venue Rd",
          capacity: 200,
          contact_name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0199",
        }),
      });
      expect(res.status).toBe(401);
    });
  });
});
