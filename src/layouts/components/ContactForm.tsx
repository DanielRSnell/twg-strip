import { useState, useEffect, useRef } from "react";

const WEBHOOK_URL = `https://m-api.thiswayglobal.com/api/webhook/forms`;
const CAL_LINK = "team/thisway/demo";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const calRef = useRef<HTMLDivElement>(null);

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!company.trim()) errors.company = "Company name is required";
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
          form_type: "contact",
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            company: company.trim(),
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
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!submitted || !calRef.current) return;

    const w = window as any;
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      w.Cal("init", "contact", { origin: "https://cal.com" });
      w.Cal.ns.contact("inline", {
        elementOrSelector: calRef.current,
        config: {
          layout: "month_view",
          name: name.trim(),
          email: email.trim(),
          notes: [
            company.trim() && `Company: ${company.trim()}`,
            phone.trim() && `Phone: ${phone.trim()}`,
            message.trim() && `Message: ${message.trim()}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
        calLink: CAL_LINK,
      });
      w.Cal.ns.contact("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [submitted]);

  if (submitted) {
    return (
      <div className="mx-auto w-full">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <svg
              className="h-8 w-8 text-brand"
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
          <h2 className="mb-2 text-2xl font-semibold text-dark">
            Thanks, {name.split(" ")[0]}!
          </h2>
          <p className="text-light">
            Pick a time below and we'll come prepared with context on{" "}
            {company.trim() || "your organization"}.
          </p>
        </div>
        <div
          ref={calRef}
          style={{ width: "100%", height: "100%", overflow: "scroll", minHeight: "600px" }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand/60 via-brand to-brand/60"></div>
        <div className="mb-6 border-b border-border/60 pb-5">
          <h2 className="mb-1 text-xl font-bold text-dark">
            Talk to Our Team
          </h2>
          <p className="text-sm text-light">
            Tell us a bit about yourself and we'll set up a conversation.
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5 gap-5 sm:flex">
            <div className="mb-5 w-full sm:mb-0">
              <label htmlFor="contact-name" className="form-label">
                Name
              </label>
              <input
                id="contact-name"
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
                <p className="mt-1.5 text-xs text-red-500">
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="contact-company" className="form-label">
                Company
              </label>
              <input
                id="contact-company"
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
          </div>

          <div className="mb-5 gap-5 sm:flex">
            <div className="mb-5 w-full sm:mb-0">
              <label htmlFor="contact-email" className="form-label">
                Email
              </label>
              <input
                id="contact-email"
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
            <div className="w-full">
              <label htmlFor="contact-phone" className="form-label">
                Phone
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone)
                    setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                className={`form-input w-full bg-tertiary/5 ${fieldErrors.phone ? "!border-red-400" : ""}`}
                placeholder="(555) 123-4567"
              />
              {fieldErrors.phone && (
                <p className="mt-1.5 text-xs text-red-500">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="contact-message" className="form-label">
              Message{" "}
              <span className="font-normal text-light">(optional)</span>
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="form-input w-full bg-tertiary/5"
              placeholder="Tell us what you're looking to accomplish"
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
                Continue to Schedule
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
