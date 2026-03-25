import { useState } from "react";

interface EmailStepProps {
  onSubmit: (email: string) => void;
}

export default function EmailStep({ onSubmit }: EmailStepProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validate = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(email.trim().toLowerCase());
  };

  return (
    <div className="text-center">
      <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
        <svg
          className="h-8 w-8 text-secondary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>

      <h2 className="mb-3 text-2xl font-semibold text-dark sm:text-3xl">
        Let's get started
      </h2>
      <p className="mx-auto mb-8 max-w-md text-base text-light">
        Enter your email address to begin the interview process. If you've
        started before, we'll pick up right where you left off.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto max-w-sm">
        <div className="mb-5">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className={`form-input w-full bg-tertiary/5 text-center text-lg ${error ? "!border-red-400" : ""}`}
            placeholder="you@example.com"
            autoFocus
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-500">{error}</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-full px-8 py-3 text-base">
          Continue
        </button>
      </form>
    </div>
  );
}
