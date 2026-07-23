import { CompanyModel } from "../models/companyModel";
import { CompanyResponseDTO, toCompanyResponseDTO } from "../DTO/companyDTO";
import { D1Database } from "@cloudflare/workers-types";

export class CompanyService {
  private companyModel: CompanyModel;
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
    this.companyModel = new CompanyModel(db);
  }

  async getUsersCompany(
    userId: number,
    companyId: number,
  ): Promise<CompanyResponseDTO | Error> {
    try {
      const company = await this.companyModel.getCompanyById(companyId);
      if (company && company.user_id === userId) {
        return await toCompanyResponseDTO(company, this.db);
      } else {
        throw new Error("Company not found or access denied");
      }
    } catch (error) {
      return error as Error;
    }
  }

  async updateCompany(
    companyId: number,
    name: string,
    email: string,
    phone: string,
    address: string,
  ): Promise<Boolean | Error> {
    try {
      const updatedCompany = await this.companyModel.updateCompany(
        companyId,
        name,
        email,
        phone,
        address,
      );
      return updatedCompany;
    } catch (error) {
      return error as Error;
    }
  }
}
