import type { LucideIcon } from "lucide-react";
import {
  Pencil,
  MessageSquare,
  BarChart3,
  Calendar,
} from "lucide-react";

export interface MockStats {
  totalViews: number;
  viewsTrend: number;
  totalInquiries: number;
  inquiriesTrend: number;
  totalBookings: number;
  bookingsTrend: number;
  conversionRate: number;
}

export type InquiryStatus = "new" | "responded" | "archived";

export interface MockInquiry {
  id: string;
  clientName: string;
  service: string;
  date: string;
  status: InquiryStatus;
}

export type BookingStatus = "pending" | "confirmed" | "completed";

export interface MockBooking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  status: BookingStatus;
}

export interface QuickAction {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}

export const mockStats: MockStats = {
  totalViews: 1247,
  viewsTrend: 12,
  totalInquiries: 23,
  inquiriesTrend: 5,
  totalBookings: 8,
  bookingsTrend: -2,
  conversionRate: 2.4,
};

export const mockInquiries: MockInquiry[] = [
  {
    id: "inq-1",
    clientName: "Sarah Johnson",
    service: "Photography",
    date: "Jul 15, 2026",
    status: "new",
  },
  {
    id: "inq-2",
    clientName: "Michael & Emma Chen",
    service: "Venue - The Grand Hall",
    date: "Jul 12, 2026",
    status: "responded",
  },
  {
    id: "inq-3",
    clientName: "Priya Patel",
    service: "Floral Design",
    date: "Jul 10, 2026",
    status: "new",
  },
  {
    id: "inq-4",
    clientName: "James Wilson",
    service: "Catering",
    date: "Jul 8, 2026",
    status: "archived",
  },
  {
    id: "inq-5",
    clientName: "Olivia Martinez",
    service: "Photography",
    date: "Jul 5, 2026",
    status: "responded",
  },
  {
    id: "inq-6",
    clientName: "David & Rachel Kim",
    service: "Venue - Rose Garden",
    date: "Jul 2, 2026",
    status: "new",
  },
];

export const mockBookings: MockBooking[] = [
  {
    id: "bk-1",
    clientName: "Anna & Tom Bradley",
    service: "Venue - The Grand Hall",
    date: "Aug 22, 2026",
    status: "confirmed",
  },
  {
    id: "bk-2",
    clientName: "Lisa Thompson",
    service: "Photography",
    date: "Sep 5, 2026",
    status: "pending",
  },
  {
    id: "bk-3",
    clientName: "Carlos & Maria Garcia",
    service: "Catering",
    date: "Sep 18, 2026",
    status: "confirmed",
  },
  {
    id: "bk-4",
    clientName: "Sophie Lee",
    service: "Floral Design",
    date: "Jun 10, 2026",
    status: "completed",
  },
  {
    id: "bk-5",
    clientName: "Nathan & Jessica Brown",
    service: "Venue - Rose Garden",
    date: "May 28, 2026",
    status: "completed",
  },
  {
    id: "bk-6",
    clientName: "Emily Davis",
    service: "Photography",
    date: "Oct 3, 2026",
    status: "pending",
  },
];

export const quickActions: QuickAction[] = [
  {
    icon: Pencil,
    label: "Edit Listings",
    description: "Update your vendor or venue details",
    href: "/vendors",
  },
  {
    icon: MessageSquare,
    label: "Respond to Inquiries",
    description: "Reply to new client messages",
    href: "/inquiries",
  },
  {
    icon: BarChart3,
    label: "View Analytics",
    description: "See detailed performance metrics",
    href: "/analytics",
  },
  {
    icon: Calendar,
    label: "Manage Calendar",
    description: "Update your availability",
    href: "/calendar",
  },
];
