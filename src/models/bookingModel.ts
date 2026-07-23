import { D1Database } from "@cloudflare/workers-types";
import { CompanyServiceTypes } from "./companyModel";

export interface BookingRow {
  id: number;
  client_id: number;
  company_id: number;
  service_type: string;
  service_id: number;
  event_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const BookingServiceTypes = {
  venue: "VENUE",
  vendor: "VENDOR",
} as const;

export const BookingStatus = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  cancelled: "CANCELLED",
  rejected: "REJECTED",
} as const;

export class BookingModel {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getAllBookingsByCompanyId(
    companyId: number,
  ): Promise<BookingRow[] | null> {
    const result = await this.db
      .prepare("SELECT * FROM bookings WHERE company_id = ?")
      .bind(companyId)
      .all<BookingRow>();
    return result.results || null;
  }

  async getAllBookingsByServiceId(
    serviceId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
  ): Promise<BookingRow[] | null> {
    const result = await this.db
      .prepare(
        "SELECT * FROM bookings WHERE service_id = ? AND service_type = ?",
      )
      .bind(serviceId, serviceType)
      .all<BookingRow>();

    return result.results || null;
  }

  async createBooking(
    clientId: number,
    companyId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    serviceId: number,
    eventDate: Date,
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "INSERT INTO bookings (client_id, service_type, service_id, event_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))",
      )
      .bind(
        clientId,
        serviceType,
        serviceId,
        eventDate.toISOString(),
        BookingStatus.pending,
      )
      .run();

    return result.success;
  }

  async getBookingsByClientId(clientId: number): Promise<BookingRow[] | null> {
    const result = await this.db
      .prepare("SELECT * FROM bookings WHERE client_id = ?")
      .bind(clientId)
      .all<BookingRow>();

    return result.results || null;
  }

  async updateBookingStatus(
    bookingId: number,
    newStatus: (typeof BookingStatus)[keyof typeof BookingStatus],
  ): Promise<boolean> {
    const result = await this.db
      .prepare(
        "UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .bind(newStatus, bookingId)
      .run();

    return result.success;
  }
}
