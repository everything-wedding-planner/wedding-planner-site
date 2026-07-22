import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { UserModel } from "../../../models/Users/userModel";

describe("UserModel", () => {
  it("findUserById — returns user for valid ID", async () => {
    const model = new UserModel(env.DB);
    // Seeded user: testvendor1 (id=1 after seeding)
    const user = await model.findUserById(1);
    expect(user).not.toBeNull();
    expect(user!.username).toBe("testvendor1");
    expect(user!.email).toBe("testvendor1@example.com");
  });

  it("findUserById — returns null for invalid ID", async () => {
    const model = new UserModel(env.DB);
    const user = await model.findUserById(99999);
    expect(user).toBeNull();
  });

  it("findUserByEmail — returns user for valid email", async () => {
    const model = new UserModel(env.DB);
    const user = await model.findUserByEmail("testvenue1@example.com");
    expect(user).not.toBeNull();
    expect(user!.username).toBe("testvenue1");
    expect(user!.email).toBe("testvenue1@example.com");
  });

  it("findUserByEmail — returns null for invalid email", async () => {
    const model = new UserModel(env.DB);
    const user = await model.findUserByEmail("nonexistent@example.com");
    expect(user).toBeNull();
  });

  it("createUser — creates and returns true", async () => {
    const model = new UserModel(env.DB);
    const result = await model.createUser(
      "newuser",
      "newuser@example.com",
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
    );
    expect(result).toBe(true);

    // Verify the user was created
    const user = await model.findUserByEmail("newuser@example.com");
    expect(user).not.toBeNull();
    expect(user!.username).toBe("newuser");
  });

  it("createUser — throws on duplicate email", async () => {
    const model = new UserModel(env.DB);
    await expect(
      model.createUser(
        "duplicate",
        "testvendor1@example.com",
        "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      ),
    ).rejects.toThrow("User with this email already exists");
  });

  it("completedOnBoarding — sets flag to 1", async () => {
    const model = new UserModel(env.DB);
    // testclient1 has completed_onboarding = 0
    const client = await model.findUserByEmail("testclient1@example.com");
    expect(client).not.toBeNull();
    expect(client!.completed_onboarding).toBe(0);

    await model.completedOnBoarding(client!.id);

    const updated = await model.findUserById(client!.id);
    expect(updated).not.toBeNull();
    expect(updated!.completed_onboarding).toBe(1);
  });
});
