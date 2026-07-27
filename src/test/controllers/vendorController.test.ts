import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("VendorController", () => {
  describe("GET /api/vendors", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/vendors");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/vendors", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Vendor",
          service_type: "Photography",
          contact_name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0199",
        }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /api/vendors/:id", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/vendors/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Updated Vendor",
          service_type: "Photography",
          contact_name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-0199",
        }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/vendors/:id/metrics", () => {
    it("returns 401 when not authenticated", async () => {
      const res = await SELF.fetch("http://localhost/api/vendors/1/metrics");
      expect(res.status).toBe(401);
    });
  });
});
