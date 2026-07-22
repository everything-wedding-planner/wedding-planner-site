import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";
import { loginUser, authGet } from "./helpers";

describe("GET /api/me", () => {
  it("Authenticated — returns 200 with user data", async () => {
    const { cookie } = await loginUser("testvendor1@example.com");

    const res = await authGet("/api/me", cookie);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.id).toBeDefined();
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe("testvendor1");
    expect(data.user.email).toBe("testvendor1@example.com");
  });

  it("Unauthenticated — returns 401", async () => {
    const res = await SELF.fetch("http://localhost/api/me");
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });
});
