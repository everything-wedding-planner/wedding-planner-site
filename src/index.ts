import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoute } from "./controllers/authController";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import type { AppBindings } from "./env";

const SESSION_SECRET = "your-super-secret-key-at-least-32-chars";

const app = new Hono<AppBindings>();

app.use("/api/*", cors());
app.use(
  sessionMiddleware({
    store: new CookieStore(),
    encryptionKey: SESSION_SECRET,
    expireAfterSeconds: 60 * 60 * 24, // 1 day
    cookieOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  }),
);

app.route("/api/auth", authRoute);

app.get("/api/me", async (c) => {
  const session = c.get("session");

  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  return c.json({ userId });
});

app.get("*", async (c) => await c.env.ASSETS.fetch(c.req.raw));

export default app;
