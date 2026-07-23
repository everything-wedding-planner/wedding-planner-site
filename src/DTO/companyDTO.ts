import { toUserResponseDTO, type UserResponseDTO } from "./userDTO";
import { D1Database } from "@cloudflare/workers-types";

export interface CompanyResponseDTO {
  id: number;
  user: UserResponseDTO | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

import type { CompanyRow } from "../models/companyModel";
import { UserModel } from "../models/Users/userModel";

export async function toCompanyResponseDTO(
  company: CompanyRow,
  db: D1Database,
): Promise<CompanyResponseDTO> {
  const userModel = new UserModel(db);

  let user = await userModel.findUserById(company.user_id);

  return {
    id: company.id,
    user: user ? toUserResponseDTO(user) : null,
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    created_at: new Date(company.created_at),
    updated_at: new Date(company.updated_at),
  };
}
