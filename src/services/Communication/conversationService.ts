import { D1Database } from "@cloudflare/workers-types";
import {
  ConversationModel,
  conversationRow,
} from "../../models/Communication/conversationModel";
import { messageResponseDTO } from "../../DTO/Communication/messageDTO";
import {
  toConversationResponseDTO,
  conversationResponseDTO,
} from "../../DTO/Communication/conversationDTO";

import { MessageService } from "./messageService";
import { CompanyModel, CompanyServiceTypes } from "../../models/companyModel";

import { VendorModel } from "../../models/vendorModel";
import { VendorService } from "../vendorService";

import { VenueModel } from "../../models/venueModel";
import { VenueService } from "../venueService";

export class ConversationService {
  private conversationModel: ConversationModel;
  private db: D1Database;
  private companyModel: CompanyModel;
  private vendorModel: VendorModel;
  private venueModel: VenueModel;

  constructor(db: D1Database) {
    this.conversationModel = new ConversationModel(db);
    this.db = db;
    this.companyModel = new CompanyModel(db);
    this.vendorModel = new VendorModel(db);
    this.venueModel = new VenueModel(db);
  }

  async getConversationRow(id: number): Promise<conversationRow | null> {
    return this.conversationModel.getConversationById(id);
  }

  async userCanAccessConversation(
    userId: number,
    conversation: conversationRow | null,
  ): Promise<boolean> {
    if (!conversation) {
      return false;
    }
    if (conversation.client_id === userId) {
      return true;
    }

    const company = await this.companyModel.getCompanyByUserId(userId);
    if (!company) {
      return false;
    }

    if (conversation.reference_type === CompanyServiceTypes.vendor) {
      const vendor = await this.vendorModel.getVendorById(
        conversation.reference_id,
      );
      return vendor !== null && vendor.company_id === company.id;
    }
    if (conversation.reference_type === CompanyServiceTypes.venue) {
      const venue = await this.venueModel.getVenueById(
        conversation.reference_id,
      );
      return venue !== null && venue.company_id === company.id;
    }
    return false;
  }

  async userCanAccessReference(
    userId: number,
    reference_id: number,
    reference_type: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
  ): Promise<boolean> {
    const company = await this.companyModel.getCompanyByUserId(userId);
    if (!company) {
      return false;
    }

    if (reference_type.toUpperCase() === CompanyServiceTypes.vendor) {
      const vendor = await this.vendorModel.getVendorById(reference_id);
      return vendor !== null && vendor.company_id === company.id;
    }
    if (reference_type.toUpperCase() === CompanyServiceTypes.venue) {
      const venue = await this.venueModel.getVenueById(reference_id);
      return venue !== null && venue.company_id === company.id;
    }
    return false;
  }

  async getConversationById(
    id: number,
  ): Promise<conversationResponseDTO | null> {
    const conversation = await this.conversationModel.getConversationById(id);
    const messageService = new MessageService(this.db);
    if (!conversation) {
      return null;
    }

    const messages: messageResponseDTO[] =
      await messageService.getMessagesByConversationId(conversation.id);

    return toConversationResponseDTO(conversation, messages, this.db);
  }

  async getConversationsByReference(
    reference_id: number,
    reference_type: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
  ): Promise<conversationResponseDTO[]> {
    const conversations =
      await this.conversationModel.getConversationsByReference(
        reference_id,
        reference_type,
      );
    const messageService = new MessageService(this.db);

    const conversationDTOs: conversationResponseDTO[] = [];
    for (const conversation of conversations) {
      const messages: messageResponseDTO[] =
        await messageService.getMessagesByConversationId(conversation.id);
      const conversationDTO = await toConversationResponseDTO(
        conversation,
        messages,
        this.db,
      );
      conversationDTOs.push(conversationDTO);
    }

    return conversationDTOs;
  }

  async getUnreadCompanyConversationsCount(
    company_id: number,
  ): Promise<number> {
    const vendorService = new VendorService(this.db);
    const venueService = new VenueService(this.db);

    const vendors = await vendorService.getVendorByCompanyId(company_id);
    const venues = await venueService.getVenueByCompanyId(company_id);

    let unreadCount = 0;
    if (vendors && !(vendors instanceof Error)) {
      for (const vendor of vendors) {
        const conversations =
          await this.conversationModel.getConversationsByReference(
            vendor.id,
            CompanyServiceTypes.vendor,
          );

        if (!conversations) {
          continue;
        }

        for (const conversation of conversations) {
          const messageService = new MessageService(this.db);
          const message: messageResponseDTO | null =
            await messageService.getLastMessageByConversationId(
              conversation.id,
            );
          console.log(
            "Last message for conversation",
            conversation.id,
            ":",
            message,
          );
          if (
            message &&
            message.read_at === null &&
            message.sender_id !== company_id
          ) {
            unreadCount++;
          }
        }
      }
    }

    if (venues && !(venues instanceof Error)) {
      console.log("Venues:", venues);
      for (const venue of venues) {
        const conversations =
          await this.conversationModel.getConversationsByReference(
            venue.id,
            CompanyServiceTypes.venue,
          );

        if (!conversations) {
          continue;
        }

        for (const conversation of conversations) {
          const messageService = new MessageService(this.db);
          const message: messageResponseDTO | null =
            await messageService.getLastMessageByConversationId(
              conversation.id,
            );
          if (
            message &&
            message.read_at === null &&
            message.sender_id !== company_id
          ) {
            unreadCount++;
          }
        }
      }
    }

    return unreadCount;
  }

  async createConversation(
    client_id: number,
    inquiry_id: number,
    reference_id: number,
    reference_type: (typeof CompanyServiceTypes)[keyof typeof CompanyServiceTypes],
  ): Promise<Boolean> {
    return this.conversationModel.createConversation(
      client_id,
      inquiry_id,
      reference_id,
      reference_type,
    );
  }

  async updateConversationStatus(
    conversationId: number,
    newStatus: string,
  ): Promise<boolean> {
    return this.conversationModel.updateConversationStatus(
      conversationId,
      newStatus,
    );
  }
}
