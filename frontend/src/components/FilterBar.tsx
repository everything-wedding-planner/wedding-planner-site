interface FilterBarProps {
  // dateFilter: string;
  // onDateFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  // serviceFilter: string;
  // onServiceFilterChange: (value: string) => void;
  statusOptions: { value: string; label: string }[];
}

const selectClass =
  "px-3 py-2 border border-gray-200 text-sm text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 bg-white min-w-[140px] cursor-pointer w-full sm:w-auto";

export default function FilterBar({
  statusFilter,
  onStatusFilterChange,
  statusOptions,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* <select
          className={selectClass}
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select> */}

      <select
        className={selectClass}
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value)}
      >
        <option value="all">All Statuses</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* <select
        className={selectClass}
        value={serviceFilter}
        onChange={(e) => onServiceFilterChange(e.target.value)}
      >
        <option value="all">All Services</option>
        <option value="VENDOR">Vendor</option>
        <option value="VENUE">Venue</option>
      </select> */}
    </div>
  );
}
