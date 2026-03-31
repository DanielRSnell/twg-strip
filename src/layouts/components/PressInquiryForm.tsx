import { useState } from "react";

const WEBHOOK_URL = `https://m-api.thiswayglobal.com/webhook/forms`;

const INQUIRY_TYPE_OPTIONS = [
  "Interview Request",
  "Quote Request",
  "Company Information",
  "Partnership / Collaboration",
  "Other",
];

export default function PressInquiryForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!organization.trim())
      errors.organization = "Organization is required";
    if (!inquiryType) errors.inquiryType = "Please select an inquiry type";
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
          form_type: "press-inquiry",
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: email.trim(),
            organization: organization.trim(),
            inquiry_type: inquiryType,
            message: message.trim(),
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
              Thank you for reaching out! Our communications team will respond
              to your inquiry shortly.
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
            <label htmlFor="email" className="form-label">
              Email
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
              placeholder="you@outlet.com"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="organization" className="form-label">
              Organization / Outlet
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                if (fieldErrors.organization)
                  setFieldErrors((p) => ({ ...p, organization: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.organization ? "!border-red-400" : ""}`}
              placeholder="e.g. The New York Times"
            />
            {fieldErrors.organization && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.organization}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="inquiryType" className="form-label">
              Inquiry Type
            </label>
            <select
              id="inquiryType"
              value={inquiryType}
              onChange={(e) => {
                setInquiryType(e.target.value);
                if (fieldErrors.inquiryType)
                  setFieldErrors((p) => ({ ...p, inquiryType: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.inquiryType ? "!border-red-400" : ""}`}
            >
              <option value="">Select inquiry type</option>
              {INQUIRY_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {fieldErrors.inquiryType && (
              <p className="mt-1.5 text-xs text-red-500">
                {fieldErrors.inquiryType}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="message" className="form-label">
              Message{" "}
              <span className="font-normal text-light">(optional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input w-full bg-tertiary/5"
              placeholder="Tell us more about your inquiry"
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
