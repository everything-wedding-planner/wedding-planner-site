import { Hono } from "hono";

import type { AppBindings } from "../env";

export const landingRoute = new Hono<AppBindings>();

landingRoute.get("/", async (c) => {
  const html = await c.env.ASSETS.fetch("/index.html");
  return html;
});
