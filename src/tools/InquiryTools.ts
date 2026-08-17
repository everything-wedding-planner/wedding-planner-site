import { D1Database } from "@cloudflare/workers-types";
import { InquiryService } from "../services/inquiryService";
import { z } from "zod";

export const createGetInquiriesForCompanyId = (db: D1Database) => ({
  description: "Grab all the inquiries for a given company ID.",
  inputSchema: z.object({ company_id: z.number() }),
  execute: async ({ company_id }) => {
    const service = new InquiryService(db);

    const inquiries = await service.getAllInquiriesForCompanyId(company_id);
    return JSON.stringify(
      inquiries instanceof Error ? { error: inquiries.message } : inquiries,
    );
  },
});

// export const createGetInquiriesForVendorId = (db: D1Database) => ({
//   description: "",
//   inputSchema: z.object({ vendor_id: z.number() }),
//   execute: async ({ vendor_id }) => {
//     const inquiries = new InquiryService(db).getInquiriesByServiceId(
//       vendor_id,
//       "VENDOR",
//     );

//     return JSON.stringify(
//       inquiries instanceof Error ? { error: inquiries.message } : inquiries,
//     );
//   },
// });

export const createGetInquiriesForService = (db: D1Database) => ({
  description:
    'Grab all the inquiries based on the service_id (Vendor or Venue Id) and service type (If the id is vendor specific the type is "VENDOR" and if it is venue specific the type is "VENUE")',
  inputSchema: z.object({ service_id: z.number(), service_type: z.string() }),
  execute: async ({ service_id, service_type }) => {
    const inquiries = await new InquiryService(db).getInquiriesByServiceId(
      service_id,
      service_type,
    );
    console.log("IN THE INQUIRIES GET SERVICE TOOL");

    return JSON.stringify(
      inquiries instanceof Error ? { error: inquiries.message } : inquiries,
    );
  },
});
