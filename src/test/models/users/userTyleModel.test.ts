import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { UserTypeModel } from "../../../models/Users/userTyleModel";

describe("UserTypeModel", () => {
  // KNOWN BUG: The UserTypeModel queries table `user_types` but the migration
  // creates table `user_type`. This causes all queries to fail with a
  // "no such table" error. These tests document the actual (buggy) behavior.

  it("getAllUserTypes — documents bug: queries wrong table name 'user_types' instead of 'user_type'", async () => {
    const model = new UserTypeModel(env.DB);
    // Bug: model queries 'user_types' but migration creates 'user_type'
    await expect(model.getAllUserTypes()).rejects.toThrow();
  });

  it("getUserTypeById — documents bug: queries wrong table name", async () => {
    const model = new UserTypeModel(env.DB);
    // Bug: model queries 'user_types' but migration creates 'user_type'
    await expect(model.getUserTypeById(1)).rejects.toThrow();
  });

  it("getUserTypeByType — documents bug: queries wrong table name", async () => {
    const model = new UserTypeModel(env.DB);
    // Bug: model queries 'user_types' but migration creates 'user_type'
    await expect(model.getUserTypeByType("vendor")).rejects.toThrow();
  });

  it("getUsersAssociatedToType — documents bug: queries wrong table name", async () => {
    const model = new UserTypeModel(env.DB);
    // Bug: model queries 'user_types' but migration creates 'user_type'
    await expect(model.getUsersAssociatedToType("vendor")).rejects.toThrow();
  });
});
