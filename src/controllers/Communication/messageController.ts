import { Hono } from "hono";
import { AppBindings } from "../../env";
import { MessageService } from "../../services/Communication/messageService";
import { ConversationService } from "../../services/Communication/conversationService";

export const messageRoute = new Hono<AppBindings>();

messageRoute.post("/", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const { conversation_id, sender_id, content } = await c.req.json();
  if (!conversation_id || !sender_id || !content) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const conversationService = new ConversationService(db);
  const conversation =
    await conversationService.getConversationRow(conversation_id);

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

  const messageService = new MessageService(db);
  const success = await messageService.createMessage(
    conversation_id,
    sender_id,
    content,
  );
  return c.json({ success });
});

messageRoute.put("/:id/read", async (c) => {
  const session = c.get("session");
  const userId = session.get("userId");
  const message_id = Number(c.req.param("id"));
  if (!message_id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const messageService = new MessageService(db);
  const message = await messageService.getMessageById(message_id);

  if (!message) {
    return c.json({ error: "Message not found" }, 404);
  }

  const conversationService = new ConversationService(db);
  const conversation = await conversationService.getConversationRow(
    message.conversation_id,
  );

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

  const success = await messageService.markMessageAsRead(message_id);
  return c.json({ success });
});
