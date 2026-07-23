import { Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";
import Sidebar, { MobileSidebar } from "./Sidebar";
import type { NavItem } from "./Sidebar";
import {
  DashboardDataProvider,
  useDashboardData,
} from "./DashboardDataProvider";
import { useAuth } from "../AuthProvider";

function DashboardContent() {
  const { company, vendors, venues } = useDashboardData();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      shouldShow: true,
    },
    {
      to: "/company",
      label: "Company",
      icon: Users,
      shouldShow: company !== null,
    },
    {
      to: "/vendors",
      label: "Vendors",
      icon: DollarSign,
      shouldShow: vendors !== null && vendors.length > 0,
    },
    {
      to: "/venues",
      label: "Venues",
      icon: Clock,
      shouldShow: venues !== null && venues.length > 0,
    },
    {
      to: "/onboarding",
      label: "Onboarding",
      icon: Sparkles,
      shouldShow: user?.completed_onboarding === false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar navItems={navItems} />

      <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
        <Outlet />
      </main>

      <MobileSidebar navItems={navItems} />
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardDataProvider>
      <DashboardContent />
    </DashboardDataProvider>
  );
}
