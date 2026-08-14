import { Ai } from "@cloudflare/workers-types";
import { createWorkersAI } from "workers-ai-provider";
import { generateText, stepCountIs } from "ai";
import type { D1Database } from "@cloudflare/workers-types";
import { tools as getTools } from "../tools/tools";
import { CompanyService } from "./companyService";
import { VenueService } from "./venueService";
import { VendorService } from "./vendorService";

export class AssistantService {
  private ai: Ai;
  private db: D1Database;
  private model: string = "@cf/zai-org/glm-4.7-flash";
  private userId: number;
  private instructions: string;
  private initPromise: Promise<void>;

  constructor(ai: Ai, db: D1Database, userId: number) {
    this.ai = ai;
    this.db = db;
    this.userId = userId;
    this.instructions =
      "You are an AI assistant for a wedding planning platform. Use the following context to provide accurate and helpful responses to user queries.";
    this.initPromise = this.init();
  }

  async init() {
    // Grab all data relavent to the user calling the assistant and register it into the model's context. This could include user id, company id, and any other relevant information that the assistant might need to know in order to provide accurate responses.
    const company = await new CompanyService(this.db).getCompanyByUserId(
      this.userId,
    );
    if (company) {
      this.instructions +=
        "\n\n Company Data:\n" + JSON.stringify(company, null, 2);
      const venues = await new VenueService(this.db).getVenueByCompanyId(
        company.id,
      );
      this.instructions +=
        "\n\n Venue Data:\n" + JSON.stringify(venues, null, 2);
      const vendors = await new VendorService(this.db).getVendorByCompanyId(
        company.id,
      );
      this.instructions +=
        "\n\n Vendor Data:\n" + JSON.stringify(vendors, null, 2);
    }
  }

  async getAssistantResponse(prompt: string): Promise<any> {
    await this.initPromise;
    const workersAi = createWorkersAI({ binding: this.ai });
    const tools = getTools(this.db);

    const newResponse = await generateText({
      model: workersAi(this.model),
      instructions: this.instructions,
      messages: [{ role: "user", content: prompt }],
      tools: tools,
      stopWhen: stepCountIs(3),
    });

    return newResponse.text;
  }
}
