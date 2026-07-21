type BadgeVariant = "new" | "pending" | "confirmed" | "completed" | "responded" | "archived";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-blue-50 text-blue-700",
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-green-50 text-green-700",
  completed: "bg-stone-100 text-stone-600",
  responded: "bg-purple-50 text-purple-700",
  archived: "bg-stone-50 text-stone-500",
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
