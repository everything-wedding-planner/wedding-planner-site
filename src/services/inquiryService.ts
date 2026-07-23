import { D1Database } from "@cloudflare/workers-types";

import { CompanyServiceTypes, CompanyModel } from "../models/companyModel";
import { VendorModel } from "../models/vendorModel";
import { VenueModel } from "../models/venueModel";
import {
  InquiryModel,
  InquiryRow,
  InquiryStatus,
} from "../models/inquiryModel";

import {
  type InquiryResponseDTO,
  toInquiryResponseDTO,
} from "../DTO/inquiryDTO";

export class InquiryService {
  private inquiryModel: InquiryModel;
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    this.inquiryModel = new InquiryModel(db);
  }

  async getAllInquiriesForAccountUser(
    userId: number,
  ): Promise<InquiryResponseDTO[] | Error> {
    let inquiries: InquiryRow[] = [];

    // This can be moved into its own CompanyService
    const companyModel = new CompanyModel(this.db);
    const companyData = await companyModel.getCompanyByUserId(userId);
    if (!companyData) {
      return Error("Company not found for the given user ID");
    }

    // This can be moved into its own VendorService or VenueService
    const vendorModel = new VendorModel(this.db);
    const venueModel = new VenueModel(this.db);

    const vendorData = await vendorModel.getVendorByCompanyId(companyData.id);
    const venueData = await venueModel.getVenuesByCompanyId(companyData.id);

    const vendorService = vendorData.length > 0 ? vendorData : null;
    const venueService = venueData.length > 0 ? venueData : null;

    if (!vendorService && !venueService) {
      return Error("No vendor or venue found for the given company ID");
    }

    if (vendorService) {
      for (const vendor of vendorService) {
        let vendorInquiries =
          await this.inquiryModel.getAllInquiriesByServiceId(
            vendor.id,
            CompanyServiceTypes.vendor,
          );
        if (vendorInquiries) {
          inquiries = inquiries.concat(vendorInquiries);
        }
      }
    }

    if (venueService) {
      for (const venue of venueService) {
        let venueInquiries = await this.inquiryModel.getAllInquiriesByServiceId(
          venue.id,
          CompanyServiceTypes.venue,
        );
        if (venueInquiries) {
          inquiries = inquiries.concat(venueInquiries);
        }
      }
    }

    const inquiryDTOs: InquiryResponseDTO[] = [];
    for (const inquiry of inquiries) {
      const inquiryDTO = await toInquiryResponseDTO(inquiry, this.db);
      inquiryDTOs.push(inquiryDTO);
    }

    return inquiryDTOs;
  }

  async createInquiry(
    serviceId: number,
    serviceType: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
    userId: number,
    eventDate: Date,
  ): Promise<boolean> {
    return await this.inquiryModel.createInquiry(
      serviceId,
      serviceType,
      userId,
      eventDate,
    );
  }
}
