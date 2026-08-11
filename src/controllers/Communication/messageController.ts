import { Hono } from "hono";
import { AppBindings } from "../../env";
import { MessageService } from "../../services/Communication/messageService";

export const messageRoute = new Hono<AppBindings>();

messageRoute.post("/", async (c) => {
  const { conversation_id, message_role, content } = await c.req.json();
  if (!conversation_id || !message_role || !content) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const messageService = new MessageService(db);
  const success = await messageService.createMessage(
    conversation_id,
    message_role,
    content,
  );
  return c.json({ success });
});

messageRoute.put("/:id/read", async (c) => {
  const message_id = Number(c.req.param("id"));
  if (!message_id) {
    return c.json({ error: "Missing required parameters" }, 400);
  }

  const db = c.env.DB;
  const messageService = new MessageService(db);
  const success = await messageService.markMessageAsRead(message_id);
  return c.json({ success });
});
