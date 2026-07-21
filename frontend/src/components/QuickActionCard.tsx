import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}

export default function QuickActionCard({
  icon: Icon,
  label,
  description,
  href,
}: QuickActionProps) {
  return (
    <Link
      to={href}
      className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer block"
    >
      <div className="bg-rose-50 rounded-lg p-2 inline-flex">
        <Icon className="h-5 w-5 text-rose-600" />
      </div>
      <p className="text-sm font-semibold text-stone-900 mt-3">{label}</p>
      <p className="text-xs text-stone-500 mt-1 hidden sm:block">
        {description}
      </p>
    </Link>
  );
}
