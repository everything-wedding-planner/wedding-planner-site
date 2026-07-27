type BadgeVariant = string;

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  ACCEPTED: "bg-green-50 text-green-700",
  REJECTED: "bg-purple-50 text-purple-700",
  CANCELLED: "bg-stone-50 text-stone-500",
};

export default function Badge({ variant, children }: BadgeProps) {
  const style = variantStyles[variant] ?? "bg-stone-50 text-stone-500";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {children}
    </span>
  );
}
