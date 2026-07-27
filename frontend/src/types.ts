export interface Inquiry {
  id: number;
  client_id: number;
  service_type: string;
  service_id: number;
  event_date: string;
  status: "NEW" | "ACCEPTED" | "CANCELLED" | "REJECTED";
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  client_id: number;
  company_id: number;
  service_type: string;
  service_id: number;
  event_date: string;
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "REJECTED";
  created_at: string;
  updated_at: string;
}
