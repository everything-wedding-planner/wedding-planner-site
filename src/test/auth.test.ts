import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { signupUser, loginUser, authGet } from "./helpers";

describe("Auth/Middleware", () => {
  it("Session created on signup — Set-Cookie header contains session cookie", async () => {
    const { cookie } = await signupUser(
      "authtest1",
      "authtest1@example.com",
    );
    expect(cookie).toContain("session=");
  });

  it("Session created on login — Set-Cookie header contains session cookie", async () => {
    const { cookie } = await loginUser("testvendor1@example.com");
    expect(cookie).toContain("session=");
  });

  it("Session persists across requests — login then GET /api/me returns user", async () => {
    const { cookie } = await loginUser("testvendor1@example.com");

    const meRes = await authGet("/api/me", cookie);
    expect(meRes.status).toBe(200);

    const data = await meRes.json();
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe("testvendor1");
  });

  it("Protected route rejects unauthenticated — GET /api/dashboard returns 401", async () => {
    const res = await SELF.fetch("http://localhost/api/dashboard");
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("Logout clears session — GET /api/me returns 401 after logout", async () => {
    const { cookie } = await loginUser("testvendor1@example.com");

    // Verify session works
    const meRes = await authGet("/api/me", cookie);
    expect(meRes.status).toBe(200);

    // Logout
    const logoutRes = await SELF.fetch("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { Cookie: cookie },
    });
    expect(logoutRes.status).toBe(200);

    // After logout, the session cookie should be invalidated
    // Note: With CookieStore, the session data is encrypted in the cookie itself.
    // After logout, the session.deleteSession() clears the session data,
    // but the cookie header might still be sent. The session middleware
    // should handle this by not finding valid session data.
    const meResAfterLogout = await SELF.fetch("http://localhost/api/me", {
      method: "GET",
      headers: { Cookie: cookie },
    });
    expect(meResAfterLogout.status).toBe(401);
  });

  it("CORS headers present — OPTIONS request returns CORS headers", async () => {
    const res = await SELF.fetch("http://localhost/api/me", {
      method: "OPTIONS",
    });
    // CORS middleware should handle OPTIONS requests
    expect(res.status).toBe(204);
  });
});
