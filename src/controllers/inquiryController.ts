import { Hono } from "hono";

import { InquiryService } from "../services/inquiryService";
import { AppBindings } from "../env";
import { InquiryStatus } from "../models/inquiryModel";

export const inquiryRoute = new Hono<AppBindings>();

inquiryRoute.get("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

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

inquiryRoute.patch("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const { status } = await c.req.json();

  if (!id || !status) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  if (!Object.values(InquiryStatus).includes(status)) {
    return c.json({ error: "Invalid status value" }, 400);
  }

  const db = c.env.DB;
  const inquiryService = new InquiryService(db);

  const result = await inquiryService.updateInquiryStatus(id, status);

  if (result) {
    return c.json({ success: true });
  }

  return c.json({ error: "Failed to update inquiry" }, 500);
});
