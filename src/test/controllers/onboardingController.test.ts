import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { signupUser, loginUser } from "../helpers";

describe("OnboardingController", () => {
  describe("POST /api/onboarding/submit", () => {
    it("Unauthorized — returns 401 when no session", async () => {
      const res = await SELF.fetch("http://localhost/api/onboarding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("Missing company data — returns 400", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");

      const res = await SELF.fetch("http://localhost/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ vendor: { businessName: "Test" } }),
      });
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Company data is required");
    });

    it("Missing vendor AND venue — returns 400", async () => {
      const { cookie } = await loginUser("testvendor1@example.com");

      const res = await SELF.fetch("http://localhost/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          company: {
            name: "Test Co",
            email: "test@co.com",
            phone: "555-0001",
            address: "100 Main St",
          },
        }),
      });
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("No vendor or venue provided");
    });

    it("Successful onboarding (vendor) — returns 200 with success", async () => {
      // Sign up a new user for onboarding
      const { cookie } = await signupUser(
        "onboardvendor",
        "onboardvendor@example.com",
      );

      const res = await SELF.fetch("http://localhost/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          company: {
            name: "Onboard Vendor Co",
            email: "onboard@vendor.com",
            phone: "555-0100",
            address: "100 Onboard St",
          },
          vendor: {
            businessName: "Onboard Photography",
            serviceType: "photography",
            contactName: "Onboard Contact",
            contactEmail: "onboard-photo@vendor.com",
            contactPhone: "555-0101",
          },
        }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it("Successful onboarding (venue) — returns 200 with success", async () => {
      // Sign up a new user for onboarding
      const { cookie } = await signupUser(
        "onboardvenue",
        "onboardvenue@example.com",
      );

      const res = await SELF.fetch("http://localhost/api/onboarding/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({
          company: {
            name: "Onboard Venue Co",
            email: "onboard@venue.com",
            phone: "555-0200",
            address: "200 Venue Rd",
          },
          venue: {
            venueName: "Onboard Grand Hall",
            address: "200 Venue Rd",
            capacity: "200",
            contactName: "Venue Contact",
            contactEmail: "hall@venue.com",
            contactPhone: "555-0201",
          },
        }),
      });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
