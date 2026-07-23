import { useAuth } from "../AuthProvider";
import { useState, useEffect } from "react";
import {
  InquiryStatus,
  type InquiryRow,
} from "../../../src/models/inquiryModel";
import {
  type BookingRow,
  BookingStatus,
} from "../../../src/models/bookingModel";
import { Eye, MessageSquare, Calendar, Percent } from "lucide-react";
import StatsCard from "../components/StatsCard";
import Card from "../components/Card";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import QuickActionCard from "../components/QuickActionCard";
import { mockStats, quickActions } from "../data/dashboardMockData";
import { useDashboardData } from "../components/DashboardDataProvider";
import type { InquiryResponseDTO } from "../../../src/DTO/inquiryDTO";
import type { BookingResponseDTO } from "../../../src/DTO/bookingDTO";
export default function DashboardHome() {
  const { company, vendors, venues } = useDashboardData();

  const { user } = useAuth();

  const [inquiries, setInquiries] = useState<InquiryResponseDTO[]>([]);
  const [bookings, setBookings] = useState<BookingResponseDTO[]>([]);

  useEffect(() => {
    fetch("/api/inquiries", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        console.log("Inquiries data:", data);
        setInquiries(data);
      })
      .catch((error) => {
        console.error("Error fetching inquiries data:", error);
      });

    fetch("/api/bookings", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        console.log("Bookings data:", data);
        setBookings(data);
      })
      .catch((error) => {
        console.error("Error fetching bookings data:", error);
      });
  }, []);

  const companyName = company?.name ? company.name : "Your Company";

  const inquiryColumns = [
    {
      key: "client_id",
      header: "Client",
      render: (item: InquiryResponseDTO) => (
        <span className="font-medium">
          {item.client?.username || "Unknown"}
        </span>
      ),
    },
    {
      key: "service_name",
      header: "Service Name",
      render: (item: InquiryResponseDTO) => (
        <span className="font-medium">{item.service?.name || "Unknown"}</span>
      ),
    },
    {
      key: "service_type",
      header: "Service",
      render: (item: InquiryResponseDTO) => (
        <span className="font-medium">
          {item.service_type === "VENDOR"
            ? item.service?.service_type || "Unknown"
            : "Wedding"}
        </span>
      ),
    },
    { key: "event_date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (item: InquiryResponseDTO) => (
        <Badge variant={item.status}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const bookingColumns = [
    {
      key: "client_id",
      header: "Client",
      render: (item: BookingResponseDTO) => (
        <span className="font-medium">
          {item.client?.username || "Unknown"}
        </span>
      ),
    },
    {
      key: "service_name",
      header: "Service Name",
      render: (item: BookingResponseDTO) => (
        <span className="font-medium">{item.service?.name || "Unknown"}</span>
      ),
    },
    {
      key: "service_type",
      header: "Service",
      render: (item: BookingResponseDTO) => (
        <span className="font-medium">
          {item.service_type === "VENDOR"
            ? item.service?.service_type || "Unknown"
            : "Wedding"}
        </span>
      ),
    },
    { key: "event_date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (item: BookingResponseDTO) => (
        <Badge variant={item.status}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
          Welcome back, {user?.username || "User"}!
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">{companyName}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Views"
          value={mockStats.totalViews.toLocaleString()}
          trend={{ value: mockStats.viewsTrend, label: "from last week" }}
          icon={Eye}
        />
        <StatsCard
          label="Inquiries"
          value={mockStats.totalInquiries}
          trend={{ value: mockStats.inquiriesTrend, label: "from last week" }}
          icon={MessageSquare}
        />
        <StatsCard
          label="Bookings"
          value={mockStats.totalBookings}
          trend={{ value: mockStats.bookingsTrend, label: "from last month" }}
          icon={Calendar}
        />
        <StatsCard
          label="Conversion Rate"
          value={`${mockStats.conversionRate}%`}
          icon={Percent}
        />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Inquiries">
          <DataTable
            columns={inquiryColumns}
            data={inquiries}
            emptyMessage="No inquiries yet"
          />
        </Card>
        <Card title="Upcoming Bookings">
          <DataTable
            columns={bookingColumns}
            data={bookings}
            emptyMessage="No upcoming bookings"
          />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.label}
              icon={action.icon}
              label={action.label}
              description={action.description}
              href={action.href}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
