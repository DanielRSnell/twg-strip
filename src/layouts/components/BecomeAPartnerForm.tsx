import { useState } from "react";

const WEBHOOK_URL = `https://m-api.thiswayglobal.com/api/webhook/forms`;

export default function BecomeAPartnerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!title.trim()) errors.title = "Title is required";
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
          form_type: "become-a-partner",
          data: {
            name: name.trim(),
            email: email.trim(),
            title: title.trim(),
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
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand/60 via-brand to-brand/60"></div>
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
              <svg
                className="h-10 w-10 text-brand"
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
              We have received your application. Our partner team will reach
              out within two business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand/60 via-brand to-brand/60"></div>
        <div className="mb-6 border-b border-border/60 pb-5">
          <h2 className="mb-1 text-xl font-bold text-dark">
            Apply to the Partner Program
          </h2>
          <p className="text-sm text-light">
            Our partner team will reach out within two business days.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name)
                  setFieldErrors((p) => ({ ...p, name: "" }));
              }}
              className={`form-input w-full bg-tertiary/5 ${fieldErrors.name ? "!border-red-400" : ""}`}
              placeholder="Your full name"
            />
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs text-red-500">{fieldErrors.name}</p>
            )}
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
              placeholder="you@company.com"
            />
            {fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="title" className="form-label">
              Title
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
              placeholder="e.g. VP of Alliances"
            />
            {fieldErrors.title && (
              <p className="mt-1.5 text-xs text-red-500">{fieldErrors.title}</p>
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
              placeholder="Tell us about your company and how you would like to partner"
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
            className={`group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(36,171,157,0.2)] transition-all duration-300 hover:bg-brand/90 hover:shadow-[0_0_30px_rgba(36,171,157,0.3)] ${submitting ? "cursor-wait opacity-70" : ""}`}
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
              <>
                Submit Application
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
