import type { VenueRow } from "../models/venueModel";
import { D1Database } from "@cloudflare/workers-types";
import { CompanyModel } from "../models/companyModel";

export interface VenueResponseDTO {
  company: string;
  name: string;
  address: string;
  contact_name: string;
  email: string;
  phone: string;
  capacity: number;
  created_at: Date;
  updated_at: Date;
}

export async function toVenueResponseDTO(
  venue: VenueRow,
  d1: D1Database,
): Promise<VenueResponseDTO> {
  const { id, company_id, ...rest } = venue;
  const companyModel = new CompanyModel(d1);
  const companyResults = await companyModel.getCompanyById(company_id);

  return {
    company: companyResults ? companyResults.name : "Unknown Company",
    name: rest.name,
    address: rest.address,
    contact_name: rest.contact_name,
    email: rest.contact_email,
    phone: rest.contact_phone,
    capacity: rest.capacity,
    created_at: new Date(rest.created_at),
    updated_at: new Date(rest.updated_at),
  };
}
