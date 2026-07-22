import { Hono } from "hono";

import { UserModel } from "../models/Users/userModel";
import bcrypt from "bcryptjs";
import type { AppBindings } from "../env";

export const authRoute = new Hono<AppBindings>();

authRoute.post("/signup", async (c) => {
  const { name, email, password } = await c.req.json();
  const session = c.get("session");

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userModel = new UserModel(c.env.DB);
    const success = await userModel.createUser(name, email, hashedPassword);
    if (!success) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return c.json({ error: "User not found after creation" }, 404);
    }

    session.set("userId", user.id);
    return c.json({ success, userId: user.id, user });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

authRoute.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const session = c.get("session");

  try {
    let userModel = new UserModel(c.env.DB);
    const user = await userModel.findUserByEmail(email);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return c.json({ error: "Invalid password" }, 401);
    }

    session.set("userId", user.id);

    return c.json({ message: "Login successful", userId: user.id, user: user });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

authRoute.post("/logout", async (c) => {
  const session = c.get("session");
  session.deleteSession();
  return c.json({ success: true });
});
