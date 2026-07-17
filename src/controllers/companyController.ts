import { Hono } from "hono";
import { CompanyModel } from "../models/companyModel";
import type { AppBindings } from "../env";

export const companyRoute = new Hono<AppBindings>();

companyRoute.get("/", async (c) => {
  let companyModel = new CompanyModel(c.env.DB);

  const companies = await companyModel.getAllCompanies();
  return c.json({ companies });
});

companyRoute.post("/create", async (c) => {
  const { name, email, phone, address } = await c.req.json();

  let companyModel = new CompanyModel(c.env.DB);

  const company = await companyModel.createCompany(name, email, phone, address);
  return c.json({ company });
});
