import { Hono } from "hono";
import { AppBindings } from "../../env";
import { ConversationService } from "../../services/Communication/conversationService";

export const conversationRoute = new Hono<AppBindings>();

conversationRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;

  const conversationService = new ConversationService(db);
  const conversationDTO = await conversationService.getConversationById(id);

  if (conversationDTO instanceof Error) {
    return c.json({ error: conversationDTO.message }, 404);
  }

  return c.json(conversationDTO);
});

conversationRoute.get("/reference/:reference_type/:reference_id", async (c) => {
  const reference_type = c.req.param("reference_type");
  const reference_id = Number(c.req.param("reference_id"));

  if (!reference_type || !reference_id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const conversationDTOs =
    await conversationService.getConversationsByReference(
      reference_id,
      reference_type,
    );

  return c.json(conversationDTOs);
});

conversationRoute.post("/", async (c) => {
  const { client_id, reference_id, reference_type } = await c.req.json();

  if (!client_id || !reference_id || !reference_type) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const success = await conversationService.createConversation(
    client_id,
    reference_id,
    reference_type,
  );
  return c.json({ success });
});

conversationRoute.put("/:id/status", async (c) => {
  const id = Number(c.req.param("id"));
  const { newStatus } = await c.req.json();

  if (!id || !newStatus) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const success = await conversationService.updateConversationStatus(
    id,
    newStatus,
  );

  if (!success) {
    return c.json({ error: "Failed to update conversation status" }, 500);
  }
  return c.json({ success });
});
