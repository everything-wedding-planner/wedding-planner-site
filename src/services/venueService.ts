import { VenueModel } from "../models/venueModel";
import { D1Database } from "@cloudflare/workers-types";

import { VenueResponseDTO, toVenueResponseDTO } from "../DTO/venueDTO";

export class VenueService {
  private db: D1Database;
  private venueModel: VenueModel;

  constructor(db: D1Database) {
    this.db = db;
    this.venueModel = new VenueModel(db);
  }

  async getVenueByCompanyId(
    companyId: number,
  ): Promise<VenueResponseDTO[] | Error> {
    try {
      const venues = await this.venueModel.getVenuesByCompanyId(companyId);

      if (!venues || venues.length === 0) {
        throw new Error("No venues found for the given company ID");
      }

      const venueDTOs = await Promise.all(
        venues.map((venue) => toVenueResponseDTO(venue, this.db)),
      );
      return venueDTOs;
    } catch (error) {
      return error as Error;
    }
  }
}
