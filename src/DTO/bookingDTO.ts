import { type UserResponseDTO, toUserResponseDTO } from "./userDTO";
import type { D1Database } from "@cloudflare/workers-types";
import type { BookingRow } from "../models/bookingModel";
import { UserModel } from "../models/Users/userModel";

import { VenueModel } from "../models/venueModel";
import { VenueResponseDTO, toVenueResponseDTO } from "./venueDTO";

import { VendorResponseDTO, toVendorResponseDTO } from "./vendorDTO";
import { VendorModel } from "../models/vendorModel";

import { BookingServiceTypes } from "../models/bookingModel";

export interface BookingResponseDTO {
  client: UserResponseDTO | null;
  service_type: string;
  service: VendorResponseDTO | VenueResponseDTO | null;
  event_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export async function toBookingResponseDTO(
  booking: BookingRow,
  d1: D1Database,
): Promise<BookingResponseDTO> {
  const { id, client_id, ...rest } = booking;

  const userModel = new UserModel(d1);

  let client = await userModel.findUserById(client_id);

  let service: VendorResponseDTO | VenueResponseDTO | null = null;
  if (rest.service_type === BookingServiceTypes.venue) {
    const venueModel = new VenueModel(d1);
    let result = await venueModel.getVenueById(rest.service_id);
    service = result ? await toVenueResponseDTO(result, d1) : null;
  } else if (rest.service_type === BookingServiceTypes.vendor) {
    const vendorModel = new VendorModel(d1);
    let result = await vendorModel.getVendorById(rest.service_id);
    service = result ? await toVendorResponseDTO(result, d1) : null;
  }

  return {
    client: client ? toUserResponseDTO(client) : null,
    service_type: rest.service_type,
    service,
    event_date: rest.event_date,
    status: rest.status,
    created_at: rest.created_at,
    updated_at: rest.updated_at,
  };
}
