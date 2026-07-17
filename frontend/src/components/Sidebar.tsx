import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/guests", label: "Guest List", icon: Users },
  { to: "/budget", label: "Budget", icon: DollarSign },
  { to: "/timeline", label: "Timeline", icon: Clock },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 h-screen p-4">
      <nav className="flex flex-col gap-1 mt-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-rose-50 text-rose-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileSidebar() {
  return (
    <aside className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-2 z-50">
      <nav className="flex items-center justify-around w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-center p-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-rose-50 text-rose-700"
                  : "text-stone-600 hover:bg-stone-100"
              }`
            }
          >
            <item.icon size={20} />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
