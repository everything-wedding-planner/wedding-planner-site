import { CompanyServiceTypes } from "../models/companyModel";
import type { ImageRow } from "../models/ImageModel";

import { VendorResponseDTO } from "./vendorDTO";
import { VendorService } from "../services/vendorService";

import { VenueResponseDTO } from "./venueDTO";
import { VenueService } from "../services/venueService";

import { D1Database } from "@cloudflare/workers-types";

export interface ImageResponseDTO {
  id: number;
  url: string;
  reference_type: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes];
  reference_id: number;
  reference: VendorResponseDTO | VenueResponseDTO | null;
  alternative_text: string | null;
  extension: string;
  position: number;
}

export async function toImageResponseDTO(
  image: ImageRow,
  db: D1Database,
): Promise<ImageResponseDTO> {
  let reference: VendorResponseDTO | VenueResponseDTO | null = null;
  if (image.reference_type === CompanyServiceTypes.vendor) {
    const vendorService = new VendorService(db);
    const vendor = await vendorService.getVendorById(image.reference_id);
    reference = vendor instanceof Error ? null : vendor;
  } else if (image.reference_type === CompanyServiceTypes.venue) {
    const venueService = new VenueService(db);
    const venue = await venueService.getVenueById(image.reference_id);
    reference = venue instanceof Error ? null : venue;
  }

  return {
    id: image.id,
    url: image.url,
    reference_type: image.reference_type,
    reference_id: image.reference_id,
    reference: reference,
    alternative_text: image.alternative_text,
    extension: image.extension,
    position: image.position,
  };
}
