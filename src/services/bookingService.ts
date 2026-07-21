import { D1Database } from "@cloudflare/workers-types";
import {
  BookingModel,
  BookingRow,
  BookingStatus,
} from "../models/bookingModel";
import { CompanyModel, CompanyServiceTypes } from "../models/companyModel";
import { VendorModel } from "../models/vendorModel";
import { VenueModel } from "../models/venueModel";

export class BookingService {
  private bookingModel: BookingModel;
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    this.bookingModel = new BookingModel(db);
  }

  // Add methods for booking-related operations here
  async getAllBookingsByUserId(userId: number): Promise<BookingRow[] | Error> {
    // This can be moved into its own CompanyService
    const companyModel = new CompanyModel(this.db);
    const companyData = await companyModel.getCompanyByUserId(userId);
    if (!companyData) {
      return Error("Company not found");
    }

    const bookings = await this.bookingModel.getAllBookingsByCompanyId(
      companyData.id,
    );
    if (!bookings) {
      return Error("No bookings found for the given company ID");
    }

    return bookings;
  }

  async createBooking(
    clientId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    serviceId: number,
    eventDate: Date,
  ): Promise<Error | boolean> {
    let companyId: number | null = null;
    if (serviceType == CompanyServiceTypes.vendor) {
      const vendorModel = new VendorModel(this.db);
      const vendorData = await vendorModel.getVendorById(serviceId);
      if (!vendorData) {
        return Error("Vendor not found");
      }
      companyId = vendorData.company_id;
    } else if (serviceType == CompanyServiceTypes.venue) {
      const venueModel = new VenueModel(this.db);
      const venueData = await venueModel.getVenueById(serviceId);
      if (!venueData) {
        return Error("Venue not found");
      }
      companyId = venueData.company_id;
    } else {
      return Error("Invalid service type");
    }

    if (!companyId) {
      return Error("Company ID not found for the given service");
    }

    return await this.bookingModel.createBooking(
      clientId,
      companyId,
      serviceType,
      serviceId,
      eventDate,
    );
  }
}
