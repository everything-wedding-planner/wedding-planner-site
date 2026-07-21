import { Hono } from "hono";

import { InquiryService } from "../services/inquiryService";
import { AppBindings } from "../env";

export const inquiryRoute = new Hono<AppBindings>();

inquiryRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const inquiryService = new InquiryService(db);

  const inquiries = await inquiryService.getAllInquiriesForAccountUser(userId);
  return c.json(inquiries);
});

inquiryRoute.post("/create", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = c.env.DB;
  const inquiryService = new InquiryService(db);

  const { serviceId, serviceType, eventDate } = await c.req.json();
  const result = await inquiryService.createInquiry(
    serviceId,
    serviceType,
    userId,
    new Date(eventDate),
  );
  if (result) {
    return c.json({ success: true }, 201);
  }

  return c.json({ error: "Failed to create inquiry" }, 500);
});
