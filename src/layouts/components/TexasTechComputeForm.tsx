import { useState } from "react";

const WEBHOOK_URL = "https://api.umbral.ai/webhook/forms";

const URGENCY_OPTIONS = [
  "Immediate",
  "Within 30 days",
  "Within 90 days",
  "Exploring options",
];

export default function TexasTechComputeForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [urgency, setUrgency] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!company.trim()) errors.company = "Company name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!title.trim()) errors.title = "Title/position is required";
    if (!urgency) errors.urgency = "Please select a timeline";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_type: "texas-tech-compute",
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            company: company.trim(),
            email: email.trim(),
            title: title.trim(),
            urgency,
            note: note.trim(),
          },
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || "Submission failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-10 w-10 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-dark sm:text-3xl">
              Thank You!
            </h2>
            <p className="mx-auto max-w-md text-base text-light">
              Your inquiry has been received. A member of our team will be in
              touch shortly to discuss computing power options from Texas Tech
              University.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="gap-5 sm:flex">
            <div className="mb-5 w-full">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName)
                    setFieldErrors((p) => ({ ...p, firstName: "" }));
                }}
                className={`form-input w-full bg-tertiary/5 ${fieldErrors.firstName ? "!border-red-400" : ""}`}
                placeholder="First name"
              />
              {fieldErrors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>
            <div className="mb-5 w-full">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (fieldErrors.lastName)
                    setFieldErrors((p) => ({ ...p, lastName: "" }));
                }}
                className={`form-input w-full bg-tertiary/5 ${fieldErrors.lastName ? "!border-red-400" : ""}`}
                placeholder="Last name"
              />
              {fieldErrors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">
                  {fieldErrors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="company" className="form-label">
              Company Name
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (fieldErrors.company)
                  setFieldErrors((p) => ({ ...p, company: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.company ? "!border-red-400" : ""}`}
              placeholder="Your company"
            />
            {fieldErrors.company && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.company}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="email" className="form-label">
              Company Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.email ? "!border-red-400" : ""}`}
              placeholder="you@company.com"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="title" className="form-label">
              Title / Position
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title)
                  setFieldErrors((p) => ({ ...p, title: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.title ? "!border-red-400" : ""}`}
              placeholder="Your role"
            />
            {fieldErrors.title && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.title}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="urgency" className="form-label">
              Timeline
            </label>
            <select
              id="urgency"
              value={urgency}
              onChange={(e) => {
                setUrgency(e.target.value);
                if (fieldErrors.urgency)
                  setFieldErrors((p) => ({ ...p, urgency: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.urgency ? "!border-red-400" : ""}`}
            >
              <option value="">Select urgency</option>
              {URGENCY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.urgency && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.urgency}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="note" className="form-label">
              Additional Notes{" "}
              <span className="font-normal text-light">(optional)</span>
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input w-full bg-tertiary/5"
              placeholder="Any additional details about your computing needs"
              rows={3}
            />
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`btn btn-primary w-full px-8 py-3 text-base ${submitting ? "cursor-wait opacity-70" : ""}`}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Inquiry"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
