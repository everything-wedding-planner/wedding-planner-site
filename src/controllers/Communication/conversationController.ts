import { Hono } from "hono";
import { AppBindings } from "../../env";
import { ConversationService } from "../../services/Communication/conversationService";
import { MessageService } from "../../services/Communication/messageService";
import { CompanyServiceTypes } from "../../models/companyModel";

export const conversationRoute = new Hono<AppBindings>();

conversationRoute.get("/:id", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const id = Number(c.req.param("id"));

  if (!id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;

  const conversationService = new ConversationService(db);
  const conversation = await conversationService.getConversationRow(id);

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const canAccess = await conversationService.userCanAccessConversation(
    userId,
    conversation,
  );
  if (!canAccess) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const conversationDTO = await conversationService.getConversationById(id);

  if (!conversationDTO) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  return c.json(conversationDTO);
});

conversationRoute.get("/reference/:reference_type/:reference_id", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const reference_type = c.req.param("reference_type");
  const reference_id = Number(c.req.param("reference_id"));

  if (!reference_type || !reference_id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  // Convert the reference_type into the corresponding CompanyServiceTypes value
  if (reference_type !== "vendor" && reference_type !== "venue") {
    return c.json({ error: "Invalid reference type" }, 400);
  }

  let reference_type_const =
    reference_type as (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes];

  const db = c.env.DB;
  const conversationService = new ConversationService(db);

  const canAccess = await conversationService.userCanAccessReference(
    userId,
    reference_id,
    reference_type_const,
  );
  if (!canAccess) {
    return c.json({ error: "Not found" }, 404);
  }

  const conversationDTOs =
    await conversationService.getConversationsByReference(
      reference_id,
      reference_type_const,
    );

  return c.json(conversationDTOs);
});

conversationRoute.get("/:id/messages", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const id = Number(c.req.param("id"));
  const since = c.req.query("since");

  if (!id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const conversation = await conversationService.getConversationRow(id);

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const canAccess = await conversationService.userCanAccessConversation(
    userId,
    conversation,
  );

  if (!canAccess) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const messageService = new MessageService(db);
  const messages = since
    ? await messageService.getMessagesByConversationIdSince(id, since)
    : await messageService.getMessagesByConversationId(id);

  return c.json({ messages });
});

conversationRoute.post("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const { client_id, inquiry_id, reference_id, reference_type } =
    await c.req.json();

  if (!client_id || !inquiry_id || !reference_id || !reference_type) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);

  const isClient = client_id === userId;
  const isCompanyOwner = await conversationService.userCanAccessReference(
    userId,
    reference_id,
    reference_type,
  );
  if (!isClient && !isCompanyOwner) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const success = await conversationService.createConversation(
    client_id,
    inquiry_id,
    reference_id,
    reference_type,
  );
  return c.json({ success });
});

conversationRoute.put("/:id/status", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const id = Number(c.req.param("id"));
  const { newStatus } = await c.req.json();

  if (!id || !newStatus) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const conversation = await conversationService.getConversationRow(id);

  if (!conversation) {
    return c.json({ error: "Conversation not found" }, 404);
  }

  const canAccess = await conversationService.userCanAccessConversation(
    userId,
    conversation,
  );
  if (!canAccess) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const success = await conversationService.updateConversationStatus(
    id,
    newStatus,
  );

  if (!success) {
    return c.json({ error: "Failed to update conversation status" }, 500);
  }
  return c.json({ success });
});
