interface ExitStepProps {
  heading: string;
  body: string;
}

export default function ExitStep({ heading, body }: ExitStepProps) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
        <svg
          className="h-10 w-10 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="mb-4 text-2xl font-semibold text-dark sm:text-3xl">
        {heading}
      </h2>
      <div className="mx-auto max-w-md text-base leading-relaxed text-light">
        {body.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
