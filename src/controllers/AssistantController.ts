import { Hono } from "hono";
import type { AppBindings } from "../env";
import { AssistantService } from "../services/assistantService";

export const assistantRoute = new Hono<AppBindings>();

assistantRoute.get("/response", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");

  const prompt = c.req.query("prompt");
  if (!prompt) {
    return c.json({ error: "Prompt is required" }, 400);
  }

  const assistantService = new AssistantService(c.env.AI, c.env.DB, userId);
  const response = await assistantService.getAssistantResponse(prompt);
  return c.json(response);
});
