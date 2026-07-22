import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { signupUser, loginUser } from "../helpers";

describe("AuthController", () => {
  describe("POST /api/auth/signup", () => {
    it("Successful signup — returns 200 with success and userId", async () => {
      const { response } = await signupUser("newuser1", "newuser1@example.com");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.userId).toBeDefined();
    });

    it("Successful signup — sets session cookie", async () => {
      const { response, cookie } = await signupUser(
        "newuser2",
        "newuser2@example.com",
      );
      expect(response.status).toBe(200);
      expect(cookie).toContain("session=");
    });

    it("Duplicate email signup — returns 400", async () => {
      const { response } = await signupUser(
        "testvendor1",
        "testvendor1@example.com",
      );
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe("User with this email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("Successful login — returns 200 with message and userId", async () => {
      const { response } = await loginUser("testvendor1@example.com");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe("Login successful");
      expect(data.userId).toBeDefined();
    });

    it("Successful login — sets session cookie", async () => {
      const { response, cookie } = await loginUser("testvendor1@example.com");
      expect(response.status).toBe(200);
      expect(cookie).toContain("session=");
    });

    it("Wrong password login — returns 401", async () => {
      const { response } = await loginUser(
        "testvendor1@example.com",
        "wrongpassword",
      );
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe("Invalid password");
    });

    it("Nonexistent user login — returns 404", async () => {
      const { response } = await loginUser("nonexistent@example.com");
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe("User not found");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("Logout clears session — returns 200 with success", async () => {
      // First login to get a session
      const { cookie } = await loginUser("testvendor1@example.com");
      expect(cookie).toContain("session=");

      // Then logout
      const logoutRes = await SELF.fetch("http://localhost/api/auth/logout", {
        method: "POST",
        headers: { Cookie: cookie },
      });
      expect(logoutRes.status).toBe(200);

      const data = await logoutRes.json();
      expect(data.success).toBe(true);
    });
  });
});
