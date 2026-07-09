import { Hono } from "hono";

import { createUser, findUserByEmail } from "../models/userModel";
import bcrypt from "bcryptjs";
import type { AppBindings } from "../env";

export const authRoute = new Hono<AppBindings>();

authRoute.post("/signup", async (c) => {
  const { name, email, password } = await c.req.json();
  const session = c.get("session");

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const success = await createUser(c.env.DB, name, email, hashedPassword);
    if (!success) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    const user = await findUserByEmail(c.env.DB, email);
    if (!user) {
      return c.json({ error: "User not found after creation" }, 404);
    }

    session.set("userId", user.id);
    return c.json({ success });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 400);
  }
});

authRoute.post("/logout", async (c) => {
  const session = c.get("session");
  session.delete("userId");
  return c.json({ message: "Logged out" });
});

authRoute.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  const session = c.get("session");

  try {
    const user = await findUserByEmail(c.env.DB, email);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return c.json({ error: "Invalid password" }, 401);
    }

    session.set("userId", user.id);

    return c.json({ message: "Login successful", userId: user.id });
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});
