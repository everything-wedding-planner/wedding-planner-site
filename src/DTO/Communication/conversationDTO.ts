import { D1Database } from "@cloudflare/workers-types";
import type { conversationRow } from "../../models/Communication/conversationModel";
import { toUserResponseDTO, type UserResponseDTO } from "../userDTO";
import { messageResponseDTO } from "./messageDTO";

import { UserModel } from "../../models/Users/userModel";

import { VenueResponseDTO, toVenueResponseDTO } from "../venueDTO";
import { VenueModel } from "../../models/venueModel";

import { VendorResponseDTO, toVendorResponseDTO } from "../vendorDTO";
import { VendorModel } from "../../models/vendorModel";

export interface conversationResponseDTO {
  id: number;
  client: UserResponseDTO | null;
  inquiry: number;
  reference_object: VendorResponseDTO | VenueResponseDTO | null;
  messages: messageResponseDTO[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

export async function toConversationResponseDTO(
  conversation: conversationRow,
  messages: messageResponseDTO[] | null,
  db: D1Database,
): Promise<conversationResponseDTO> {
  const userModel = new UserModel(db);
  let user: UserResponseDTO | null = null;
  try {
    const userRow = await userModel.findUserById(conversation.client_id);
    if (userRow) {
      user = toUserResponseDTO(userRow);
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  let reference_object: VendorResponseDTO | VenueResponseDTO | null = null;
  if (conversation.reference_type === "vendor") {
    const vendorModel = new VendorModel(db);
    reference_object = await vendorModel
      .getVendorById(conversation.reference_id)
      .then((vendor) => {
        if (vendor) {
          return toVendorResponseDTO(vendor, db);
        }
        return null;
      });
  } else if (conversation.reference_type === "venue") {
    const venueModel = new VenueModel(db);
    reference_object = await venueModel
      .getVenueById(conversation.reference_id)
      .then((venue) => {
        if (venue) {
          return toVenueResponseDTO(venue, db);
        }
        return null;
      });
  }

  return {
    id: conversation.id,
    client: user,
    inquiry: conversation.inquiry_id,
    reference_object: reference_object,
    messages: messages ?? [],
    status: conversation.status,
    created_at: new Date(conversation.created_at),
    updated_at: new Date(conversation.updated_at),
  };
}
