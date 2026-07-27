import { VendorModel } from "../models/vendorModel";
import { D1Database } from "@cloudflare/workers-types";

import { VendorResponseDTO, toVendorResponseDTO } from "../DTO/vendorDTO";

export class VendorService {
  private db: D1Database;
  private vendorModel: VendorModel;

  constructor(db: D1Database) {
    this.db = db;
    this.vendorModel = new VendorModel(db);
  }

  async getVendorByCompanyId(
    companyId: number,
  ): Promise<VendorResponseDTO[] | Error> {
    try {
      const vendors = await this.vendorModel.getVendorsByCompanyId(companyId);

      if (!vendors || vendors.length === 0) {
        throw new Error("No vendors found for the given company ID");
      }

      const vendorDTOs = await Promise.all(
        vendors.map((vendor) => toVendorResponseDTO(vendor, this.db)),
      );
      return vendorDTOs;
    } catch (error) {
      return error as Error;
    }
  }

  async getVendorById(id: number): Promise<VendorResponseDTO | Error> {
    try {
      const vendor = await this.vendorModel.getVendorById(id);

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      const vendorDTO = await toVendorResponseDTO(vendor, this.db);
      return vendorDTO;
    } catch (error) {
      return error as Error;
    }
  }

  async updateVendor(
    id: number,
    name: string,
    service_type: string,
    contact_name: string,
    contact_email: string,
    contact_phone: string,
  ): Promise<boolean> {
    try {
      const success = await this.vendorModel.updateVendor(
        id,
        name,
        service_type,
        contact_name,
        contact_email,
        contact_phone,
      );
      return success;
    } catch {
      return false;
    }
  }
}
