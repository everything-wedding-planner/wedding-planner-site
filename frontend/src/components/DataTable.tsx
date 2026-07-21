import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-stone-500 py-4 text-center">{emptyMessage}</p>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <table className="hidden sm:table w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider border-b border-stone-200 px-4 py-3"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={idx}
              className="hover:bg-stone-50 border-b border-stone-100 last:border-0"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="text-sm text-stone-900 px-4 py-3"
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card layout */}
      <div className="sm:hidden space-y-3">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-stone-100 rounded-lg p-4"
          >
            {columns.map((col, colIdx) => {
              const isPrimary = colIdx === 0;
              const isLast = colIdx === columns.length - 1;

              // Last column gets badge treatment on mobile
              if (isLast && columns.length > 2) {
                return (
                  <div key={col.key} className="mt-2">
                    {col.render
                      ? col.render(item)
                      : (item[col.key] as ReactNode)}
                  </div>
                );
              }

              // Secondary columns (non-primary, non-last) are compact
              return (
                <p
                  key={col.key}
                  className={
                    isPrimary
                      ? "text-sm font-medium text-stone-900"
                      : "text-sm text-stone-500"
                  }
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key] as ReactNode)}
                </p>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}
