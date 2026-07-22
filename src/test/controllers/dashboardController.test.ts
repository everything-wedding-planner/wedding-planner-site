import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { loginUser, authGet } from "../helpers";

describe("DashboardController", () => {
  describe("GET /api/dashboard", () => {
    it("Unauthenticated — returns 401", async () => {
      const res = await SELF.fetch("http://localhost/api/dashboard");
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("Authenticated, not onboarded — returns 200 with success (no data)", async () => {
      const { cookie } = await loginUser("testclient1@example.com");
      // testclient1 has completed_onboarding = 0

      const res = await authGet("/api/dashboard", cookie);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeUndefined();
    });

    // KNOWN BUG: dashboardController uses getCompanyById(userId) instead of
    // getCompanyByUserId(userId). This means it looks up a company by its
    // ID using the userId value, which will almost certainly return null
    // (unless userId happens to match a company ID). The result is that
    // even onboarded users with valid companies will get an empty response.
    it("Authenticated, onboarded — documents bug: getCompanyById(userId) returns empty", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");
      // testvendor1 has completed_onboarding = 1

      const res = await authGet("/api/dashboard", cookie);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      // Due to the bug, getCompanyById(userId) where userId=1 might return
      // null (no company with id=1 seeded), so data.data is undefined
      // even though the user is onboarded.
      expect(data.data).toBeUndefined();
    });
  });
});
