import { Hono } from "hono";
import { cors } from "hono/cors";
import { UserModel } from "./models/Users/userModel";
import { authRoute } from "./controllers/authController";
import { vendorRoute } from "./controllers/vendorController";
import { companyRoute } from "./controllers/companyController";
import { venueRoute } from "./controllers/venueController";
import { onboardingRoute } from "./controllers/onboardingController";
import { dashboardRoute } from "./controllers/dashboardController";
import { CookieStore, sessionMiddleware } from "hono-sessions";
import type { AppBindings } from "./env";

const app = new Hono<AppBindings>();

app.use("/api/*", cors());
app.use("/api/*", async (c, next) => {
  const middleware = sessionMiddleware({
    store: new CookieStore(),
    encryptionKey: c.env.SESSION_SECRET,
    expireAfterSeconds: 60 * 60 * 24, // 1 day
    cookieOptions: {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  });
  return middleware(c, next);
});

app.route("/api/auth", authRoute);
app.route("/api/vendors", vendorRoute);
app.route("/api/companies", companyRoute);
app.route("/api/venues", venueRoute);
app.route("/api/onboarding", onboardingRoute);
app.route("/api/dashboard", dashboardRoute);

app.get("/api/me", async (c) => {
  const session = c.get("session");
  const db = c.env.DB;

  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userModel = new UserModel(db);
  let user = await userModel.findUserById(userId);

  return c.json({ id: userId, user: user });
});

app.get("*", async (c) => await c.env.ASSETS.fetch(c.req.raw));

export default app;
