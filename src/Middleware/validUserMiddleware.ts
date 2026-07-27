import type { Context, Next } from "hono";
import type { AppBindings } from "../env";

export const validUserMiddleware = async (
  c: Context<AppBindings>,
  next: Next,
) => {
  const skipAuthPaths = [
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
  ];
  if (skipAuthPaths.includes(c.req.path)) {
    return next();
  }
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};
