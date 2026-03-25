import type { FunnelStep } from "./types";

const STEPS: { key: FunnelStep; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "video", label: "Watch Video" },
  { key: "form", label: "Questions" },
  { key: "complete", label: "Complete" },
];

interface ProgressBarProps {
  currentStep: FunnelStep;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mb-10 flex items-center justify-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${
                i < currentIdx
                  ? "bg-emerald-500 text-white"
                  : i === currentIdx
                    ? "bg-secondary text-white"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {i < currentIdx ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                i <= currentIdx ? "text-dark" : "text-gray-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-1 h-px w-8 sm:w-12 ${
                i < currentIdx ? "bg-emerald-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
