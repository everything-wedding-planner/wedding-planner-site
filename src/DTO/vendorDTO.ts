import type { VendorRow } from "../models/vendorModel";
import { D1Database } from "@cloudflare/workers-types";
import { CompanyModel } from "../models/companyModel";

export interface VendorResponseDTO {
  company: string;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  service_type: string;
  created_at: Date;
  updated_at: Date;
}

export async function toVendorResponseDTO(
  vendor: VendorRow,
  d1: D1Database,
): Promise<VendorResponseDTO> {
  const { id, company_id, ...rest } = vendor;
  const companyModel = new CompanyModel(d1);
  const companyResults = await companyModel.getCompanyById(company_id);

  return {
    company: companyResults ? companyResults.name : "Unknown Company",
    name: rest.name,
    contact_name: rest.contact_name,
    email: rest.contact_email,
    phone: rest.contact_phone,
    service_type: rest.service_type,
    created_at: new Date(rest.created_at),
    updated_at: new Date(rest.updated_at),
  };
}
