import {
  createGetCompanyBookingTool,
  createGetBookingForServiceTool,
} from "./BookingTools";
import {
  createGetInquiriesForCompanyId,
  createGetInquiriesForService,
} from "./InquiryTools";
import {
  createGetCompanyConversationTool,
  createGetConversationByServiceTool,
} from "./ConversationTools";

export const tools = (db: any) => ({
  get_company_bookings: createGetCompanyBookingTool(db),
  get_service_bookings: createGetBookingForServiceTool(db),
  get_company_inquiries: createGetInquiriesForCompanyId(db),
  get_service_inquiries: createGetInquiriesForService(db),
  get_company_conversations: createGetCompanyConversationTool(db),
  get_service_conversations: createGetConversationByServiceTool(db),
});
