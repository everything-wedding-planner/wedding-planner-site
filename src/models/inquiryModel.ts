import { D1Database } from "@cloudflare/workers-types";
import { CompanyServiceTypes } from "./companyModel";

export interface InquiryRow {
  id: number;
  client_id: number;
  service_type: string;
  service_id: number;
  event_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const InquiryStatus = {
  new: "NEW",
  accepted: "ACCEPTED",
  cancelled: "CANCELLED",
  rejected: "REJECTED",
} as const;

export class InquiryModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllInquiriesByServiceId(
    serviceId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
  ): Promise<InquiryRow[] | null> {
    const result = await this.db
      .prepare(
        "SELECT * FROM inquiries WHERE service_id = ? AND service_type = ?",
      )
      .bind(serviceId, serviceType)
      .all<InquiryRow>();

    return result.results || null;
  }

  async createInquiry(
    clientId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    serviceId: number,
    eventDate: Date,
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO inquiries (client_id, service_type, service_id, event_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(
        clientId,
        serviceType,
        serviceId,
        eventDate.toISOString(),
        InquiryStatus.new,
      )
      .run();

    return result.success;
  }

  async getInquiriesByClientId(clientId: number): Promise<InquiryRow[] | null> {
    const result = await this.db
      .prepare("SELECT * FROM inquiries WHERE client_id = ?")
      .bind(clientId)
      .all<InquiryRow>();

    return result.results || null;
  }

  async updateInquiryStatus(
    inquiryId: number,
    newStatus: (typeof InquiryStatus)[keyof typeof InquiryStatus],
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(newStatus, inquiryId)
      .run();

    return result.success;
  }
}
