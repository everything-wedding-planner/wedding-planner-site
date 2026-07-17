import { Hono } from "hono";

import { VendorModel } from "../models/vendorModel";
import bcrypt from "bcryptjs";
import type { AppBindings } from "../env";

export const vendorRoute = new Hono<AppBindings>();

vendorRoute.get("/", async (c) => {
  let vendorModel = new VendorModel(c.env.DB);

  const vendors = await vendorModel.getAllVendors();
  return c.json({ vendors });
});

vendorRoute.post("/create", async (c) => {
  const { name, email, phone, address } = await c.req.json();

  let vendorModel = new VendorModel(c.env.DB);

  const vendor = await vendorModel.createVendor(name, email, phone, address);
  return c.json({ vendor });
});
