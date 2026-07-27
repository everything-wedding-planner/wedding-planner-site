interface StatusSelectProps {
  currentStatus: string;
  type: "inquiry" | "booking";
  onStatusChange: (newStatus: string) => void;
}

const inquiryOptions = ["ACCEPTED", "CANCELLED", "REJECTED"] as const;
const bookingOptions = ["ACCEPTED", "CANCELLED", "REJECTED"] as const;

export default function StatusSelect({
  currentStatus,
  type,
  onStatusChange,
}: StatusSelectProps) {
  const options = type === "inquiry" ? inquiryOptions : bookingOptions;
  const filtered = options.filter((o) => o !== currentStatus);

  if (filtered.length === 0) return null;

  return (
    <select
      value=""
      onChange={(e) => {
        if (e.target.value) onStatusChange(e.target.value);
      }}
      className="text-xs border border-stone-200 rounded-md px-2 py-1 text-stone-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
    >
      <option value="" disabled>
        Change status…
      </option>
      {filtered.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
