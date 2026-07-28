import { Hono } from "hono";

import { ImageService } from "../services/imageService";
import type { AppBindings } from "../env";
import { CompanyServiceTypes } from "../models/companyModel";

export const imageRoute = new Hono<AppBindings>();

imageRoute.get("", async (c) => {
  const { referenceType, referenceId } = c.req.query();
  if (!referenceType || !referenceId) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  // Lets assert that referenceType is a valid CompanyServiceTypes value
  if (!Object.values(CompanyServiceTypes).includes(referenceType as any)) {
    return c.json({ error: "Invalid referenceType value" }, 400);
  }

  const imageService = new ImageService(c.env.DB, c.env.R2_BUCKET);
  const images = await imageService.getImagesByReference(
    referenceType,
    Number(referenceId),
  );
  return c.json(images);
});

imageRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const imageService = new ImageService(c.env.DB, c.env.R2_BUCKET);
  const result = await imageService.deleteImage(id);
  if (!result) {
    return c.json({ error: "Failed to delete image" }, 500);
  }

  return c.json({ success: true });
});

imageRoute.post("", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const referenceType = formData.get("referenceType") as string | null;
  const referenceId = formData.get("referenceId") as string | null;
  const alternativeText = formData.get("alternativeText") as string | null;

  if (!file || !referenceType || !referenceId) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  // Lets assert that referenceType is a valid CompanyServiceTypes value
  if (!Object.values(CompanyServiceTypes).includes(referenceType as any)) {
    return c.json({ error: "Invalid referenceType value" }, 400);
  }

  const imageService = new ImageService(c.env.DB, c.env.R2_BUCKET);
  try {
    await imageService.createImageModel(
      file,
      referenceType,
      Number(referenceId),
      alternativeText,
    );
    return c.json({ success: true });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create image" }, 500);
  }
});
