import type { AssistantReply } from "./types";

export interface AssistantService {
  getResponse(input: string): Promise<AssistantReply>;
}

const REPLY_DELAY_MS = 600;

const summaryReply: AssistantReply = {
  blocks: [
    {
      type: "heading",
      text: "Here's a summary of your recent conversations",
    },
    {
      type: "paragraph",
      text: "You have 4 active conversations this week:",
    },
    {
      type: "bullets",
      items: [
        "Sarah Johnson — checking June availability for photography",
        "Michael & Emma Chen — venue booking confirmed at The Grand Hall",
        "Priya Patel — new floral design inquiry, awaiting your reply",
        "David & Rachel Kim — requested a Rose Garden venue tour",
      ],
    },
    {
      type: "paragraph",
      text: "3 conversations still need a reply. Head to Messages to keep things moving.",
    },
  ],
};

const deadlinesReply: AssistantReply = {
  blocks: [
    { type: "heading", text: "Upcoming deadlines and bookings" },
    {
      type: "paragraph",
      text: "Here's what's on the calendar for the next 30 days:",
    },
    {
      type: "bullets",
      items: [
        "Aug 22 — The Grand Hall: Anna & Tom Bradley (confirmed)",
        "Sep 5 — Photography: Lisa Thompson (pending confirmation)",
        "Sep 18 — Catering: Carlos & Maria Garcia (confirmed)",
      ],
    },
    {
      type: "paragraph",
      text: "One booking is pending confirmation — follow up soon to lock it in.",
    },
  ],
};

const insightsReply: AssistantReply = {
  blocks: [
    { type: "heading", text: "How your listings are performing" },
    {
      type: "paragraph",
      text: "Overall your profile is trending up this month:",
    },
    {
      type: "bullets",
      items: [
        "1,247 total views (+12% vs last week)",
        "23 inquiries received (+5% vs last week)",
        "8 bookings this month",
        "2.4% conversion rate from views to bookings",
      ],
    },
    {
      type: "paragraph",
      text: "Photography is your top performer — consider refreshing its photos to keep the momentum.",
    },
  ],
};

const fallbackReply: AssistantReply = {
  blocks: [
    { type: "heading", text: "I can help with a few things" },
    {
      type: "paragraph",
      text: "I'm a mock assistant for this preview. Try one of these:",
    },
    {
      type: "bullets",
      items: [
        "Summarize my conversations",
        "What's coming up next week?",
        "How are my listings performing?",
      ],
    },
  ],
};

function matchReply(input: string): AssistantReply {
  const text = input.toLowerCase();
  if (/(summar|conversation|message)/.test(text)) return summaryReply;
  if (/(deadline|upcoming|next week|calendar|coming up|schedule|follow)/.test(text))
    return deadlinesReply;
  if (/(perform|insight|analytics|view|stat|trend|conversion)/.test(text))
    return insightsReply;
  return fallbackReply;
}

export class MockAssistantService implements AssistantService {
  async getResponse(input: string): Promise<AssistantReply> {
    await new Promise((resolve) => setTimeout(resolve, REPLY_DELAY_MS));
    return matchReply(input);
  }
}

export const assistantService: AssistantService = new MockAssistantService();

export async function getAssistantResponse(
  input: string,
): Promise<AssistantReply> {
  return assistantService.getResponse(input);
}
