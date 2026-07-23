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
}
