import { useAuth } from "../AuthProvider";
import { useState, useEffect } from "react";
import type { CompanyRow } from "../../../src/models/companyModel";
import type { VendorRow } from "../../../src/models/vendorModel";
import type { VenueRow } from "../../../src/models/venueModel";
import { Eye, MessageSquare, Calendar, Percent } from "lucide-react";
import StatsCard from "../components/StatsCard";
import Card from "../components/Card";
import Badge from "../components/Badge";
import DataTable from "../components/DataTable";
import QuickActionCard from "../components/QuickActionCard";
import {
  mockStats,
  mockInquiries,
  mockBookings,
  quickActions,
} from "../data/dashboardMockData";
import type { MockInquiry, MockBooking } from "../data/dashboardMockData";

export default function DashboardHome() {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [venues, setVenues] = useState<VenueRow[]>([]);

  useEffect(() => {
    fetch("/api/dashboard", { credentials: "include" })
      .then((res) => {
        console.log(res);
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setCompany(data.data.company);
        setVendors(data.data.vendors);
        setVenues(data.data.venues);
      })
      .catch((error) => {
        setCompany(null);
        setVendors([]);
        setVenues([]);
        console.error("Error fetching dashboard data:", error);
      });
  }, []);

  const companyName = "Your Business";

  const inquiryColumns = [
    {
      key: "clientName",
      header: "Client",
      render: (item: MockInquiry) => (
        <span className="font-medium">{item.clientName}</span>
      ),
    },
    { key: "service", header: "Service" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (item: MockInquiry) => (
        <Badge variant={item.status}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      ),
    },
  ];

  const bookingColumns = [
    {
      key: "clientName",
      header: "Client",
      render: (item: MockBooking) => (
        <span className="font-medium">{item.clientName}</span>
      ),
    },
    { key: "service", header: "Service" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Status",
      render: (item: MockBooking) => (
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
            data={mockInquiries}
            emptyMessage="No inquiries yet"
          />
        </Card>
        <Card title="Upcoming Bookings">
          <DataTable
            columns={bookingColumns}
            data={mockBookings}
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
