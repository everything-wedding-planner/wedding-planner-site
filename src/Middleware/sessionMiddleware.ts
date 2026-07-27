import { Context, Next } from "hono";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import { AppBindings } from "../env";

export const customSessionMiddleware = async (
  c: Context<AppBindings>,
  next: Next,
) => {
  const middleware = sessionMiddleware({
    store: new CookieStore(),
    encryptionKey: c.env.SESSION_SECRET!,
    expireAfterSeconds: 60 * 60 * 24, // 1 day
    cookieOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  });
  return middleware(c, next);
};
