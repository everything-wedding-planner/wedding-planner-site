import { D1Database } from "@cloudflare/workers-types";
import { ConversationService } from "../services/Communication/conversationService";
import { z } from "zod";

export const createGetCompanyConversationTool = (db: D1Database) => ({
  description: "Grab all the conversation information for a given company ID.",
  inputSchema: z.object({ company_id: z.number() }),
  execute: async ({ company_id }) => {
    const conversations = await new ConversationService(
      db,
    ).getConversationsByCompanyId(company_id);
    return JSON.stringify(
      conversations instanceof Error
        ? { error: conversations.message }
        : conversations,
    );
  },
});

export const createGetConversationByServiceTool = (db: D1Database) => ({
  description:
    'Grab all the conversation information for a given service ID and service type (If the id is vendor specific the type is "VENDOR" and if it is venue specific the type is "VENUE")',
  inputSchema: z.object({ service_id: z.number(), service_type: z.string() }),
  execute: async ({ service_id, service_type }) => {
    const conversations = await new ConversationService(
      db,
    ).getConversationsByReference(service_id, service_type);
    return JSON.stringify(
      conversations instanceof Error
        ? { error: conversations.message }
        : conversations,
    );
  },
});
