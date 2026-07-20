interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-stone-200 p-4 sm:p-6 ${className}`}
    >
      {title && (
        <h2 className="text-base sm:text-lg font-semibold text-stone-900 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
