import { Outlet } from "react-router-dom";
import Sidebar, { MobileSidebar } from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-6 overflow-auto pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileSidebar />
    </div>
  );
}
