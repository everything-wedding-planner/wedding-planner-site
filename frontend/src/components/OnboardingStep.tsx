import { ChevronLeft } from "lucide-react";

interface OnboardingStepProps {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  onBack?: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
}

export default function OnboardingStep({
  title,
  subtitle,
  step,
  totalSteps,
  onBack,
  onSkip,
  children,
}: OnboardingStepProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12">
      <div className="relative w-full max-w-md">
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute -top-10 right-0 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now &rarr;
          </button>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < step ? "bg-rose-600" : "bg-gray-300"
                }`}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}

          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          )}

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
