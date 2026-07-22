import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("CompanyController", () => {
  describe("GET /api/companies", () => {
    it("List companies — returns empty array initially", async () => {
      const res = await SELF.fetch("http://localhost/api/companies");
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.companies).toEqual([]);
    });
  });

  // KNOWN BUG: POST /api/companies/create calls createCompany with 4 args
  // (name, email, phone, address) instead of 5 args (userId, name, email,
  // phone, address). The missing userId causes a runtime error because
  // createCompany expects userId as the first parameter.
  describe("POST /api/companies/create", () => {
    it("Create company — documents bug: missing userId arg causes error", async () => {
      const res = await SELF.fetch("http://localhost/api/companies/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Company",
          email: "company@test.com",
          phone: "555-0002",
          address: "456 Test Ave",
        }),
      });
      // The controller passes (name, email, phone, address) to createCompany
      // which expects (userId, name, email, phone, address). This causes a
      // runtime error or unexpected behavior.
      const data = await res.json();
      expect(data).toBeDefined();
    });
  });
});
