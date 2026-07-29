import { Hono } from "hono";
import { cors } from "hono/cors";
import { UserModel } from "./models/Users/userModel";
import { authRoute } from "./controllers/authController";
import { vendorRoute } from "./controllers/vendorController";
import { companyRoute } from "./controllers/companyController";
import { venueRoute } from "./controllers/venueController";
import { onboardingRoute } from "./controllers/onboardingController";
import { dashboardRoute } from "./controllers/dashboardController";
import { bookingRoute } from "./controllers/bookingController";
import { inquiryRoute } from "./controllers/inquiryController";
import { imageRoute } from "./controllers/imageController";
import type { AppBindings } from "./env";

import { validUserMiddleware, customSessionMiddleware } from "./Middleware";

const app = new Hono<AppBindings>();

app.use("/api/*", cors());
app.use("/api/*", customSessionMiddleware);
app.use("/api/*", validUserMiddleware);

app.route("/api/auth", authRoute);
app.route("/api/vendors", vendorRoute);
app.route("/api/companies", companyRoute);
app.route("/api/venues", venueRoute);
app.route("/api/onboarding", onboardingRoute);
app.route("/api/dashboard", dashboardRoute);
app.route("/api/bookings", bookingRoute);
app.route("/api/inquiries", inquiryRoute);
app.route("/api/images", imageRoute);

app.get("/api/me", async (c) => {
  const session = c.get("session");
  const db = c.env.DB;

  const userId = session.get("userId");

  const userModel = new UserModel(db);
  let user = await userModel.findUserById(userId);

  return c.json({ id: userId, user: user });
});

app.get("*", async (c) => await c.env.ASSETS.fetch(c.req.raw));

export default app;
