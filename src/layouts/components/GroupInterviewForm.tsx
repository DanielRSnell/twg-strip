import { useEffect, useState, useCallback } from "react";
import { FaGoogle, FaMicrosoft } from "react-icons/fa";

const WEBHOOK_URL = "https://api.umbral.ai/webhook/group-interview";

interface SlotInfo {
  date: string;
  iso: string;
  label: string;
  day: string;
  time: string;
}

const INTERVIEW_SLOTS: SlotInfo[] = [
  {
    date: "2026-02-09",
    iso: "2026-02-09T18:00:00.000Z",
    label: "Monday, Feb 9 - 12:00–12:30 PM CT",
    day: "Mon, Feb 9",
    time: "12:00 – 12:30 PM CT",
  },
  {
    date: "2026-02-10",
    iso: "2026-02-10T22:00:00.000Z",
    label: "Tuesday, Feb 10 - 4:00–4:30 PM CT",
    day: "Tue, Feb 10",
    time: "4:00 – 4:30 PM CT",
  },
  {
    date: "2026-02-11",
    iso: "2026-02-11T15:30:00.000Z",
    label: "Wednesday, Feb 11 - 9:30–10:00 AM CT",
    day: "Wed, Feb 11",
    time: "9:30 – 10:00 AM CT",
  },
  {
    date: "2026-02-12",
    iso: "2026-02-12T18:00:00.000Z",
    label: "Thursday, Feb 12 - 12:00–12:30 PM CT",
    day: "Thu, Feb 12",
    time: "12:00 – 12:30 PM CT",
  },
  {
    date: "2026-02-13",
    iso: "2026-02-13T16:00:00.000Z",
    label: "Friday, Feb 13 - 10:00–10:30 AM CT",
    day: "Fri, Feb 13",
    time: "10:00 – 10:30 AM CT",
  },
];

interface Availability {
  available: number;
  total: number;
  registered: number;
  is_available: boolean;
}

type Step = "select" | "info" | "confirm";

export default function GroupInterviewForm() {
  const [step, setStep] = useState<Step>("select");
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [availability, setAvailability] = useState<
    Record<string, Availability>
  >({});
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Parse query params for prefilling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("firstName")) setFirstName(params.get("firstName")!);
    if (params.get("lastName")) setLastName(params.get("lastName")!);
    if (params.get("email")) setEmail(params.get("email")!);
    if (params.get("phone")) setPhone(params.get("phone")!);
  }, []);

  // Fetch availability for all slots
  const fetchAvailability = useCallback(async () => {
    setLoadingSlots(true);
    try {
      const results = await Promise.all(
        INTERVIEW_SLOTS.map(async (slot) => {
          try {
            const res = await fetch(WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "check",
                interview_date: slot.iso,
              }),
            });
            const data = await res.json();
            return { date: slot.date, data };
          } catch {
            return {
              date: slot.date,
              data: {
                available: 100,
                total: 100,
                registered: 0,
                is_available: true,
              },
            };
          }
        }),
      );
      const avail: Record<string, Availability> = {};
      results.forEach((r) => {
        avail[r.date] = r.data;
      });
      setAvailability(avail);
    } catch {
      // Silently handle - slots will show as available
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[\d\s\-+().]{7,}$/.test(phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields() || !selectedSlot) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          interview_date: selectedSlot.iso,
          interview_label: selectedSlot.label,
        }),
      });

      if (!res.ok) throw new Error("Registration failed");

      const data = await res.json();
      if (data.success) {
        setStep("confirm");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if a slot's date has passed
  const isSlotPassed = (slot: SlotInfo) => {
    return new Date(slot.iso) < new Date();
  };

  // Get the closest N upcoming (not passed) slot dates
  const getClosestUpcomingDates = (count: number): string[] => {
    const now = new Date();
    return INTERVIEW_SLOTS.filter((slot) => new Date(slot.iso) >= now)
      .sort((a, b) => new Date(a.iso).getTime() - new Date(b.iso).getTime())
      .slice(0, count)
      .map((slot) => slot.date);
  };

  const getAvailabilityBadge = (slot: SlotInfo) => {
    const avail = availability[slot.date];

    // Loading state
    if (!avail)
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Loading...
        </span>
      );

    // Priority 1: Date has passed → Closed
    if (isSlotPassed(slot))
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
          Closed
        </span>
      );

    // Priority 2: Slot is full
    if (!avail.is_available)
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
          Full
        </span>
      );

    // Priority 3: One of closest 3 upcoming dates → urgency
    const closest3 = getClosestUpcomingDates(3);
    if (closest3.includes(slot.date))
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          Few spots remaining
        </span>
      );

    // Priority 4: Available (dates further out)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Available
      </span>
    );
  };

  // Step indicator
  const StepIndicator = () => {
    const steps = [
      { key: "select", label: "Select Date" },
      { key: "info", label: "Your Info" },
      { key: "confirm", label: "Confirmed" },
    ];
    const currentIdx = steps.findIndex((s) => s.key === step);
    return (
      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
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
            {i < steps.length - 1 && (
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
  };

  // Step 1: Select slot
  const renderSelectStep = () => (
    <div>
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-dark sm:text-3xl">
          Choose Your Interview Slot
        </h2>
        <p className="mx-auto max-w-lg text-base text-light">
          Select a date and time that works best for you. Each session is a
          30-minute group interview.
        </p>
      </div>
      <div className="mx-auto max-w-xl space-y-3">
        {INTERVIEW_SLOTS.map((slot) => {
          const avail = availability[slot.date];
          const isFull = avail && !avail.is_available;
          const isPassed = isSlotPassed(slot);
          const isDisabled = isFull || isPassed;

          return (
            <button
              key={slot.date}
              onClick={() => {
                if (!isDisabled) {
                  setSelectedSlot(slot);
                  setStep("info");
                }
              }}
              disabled={isDisabled || loadingSlots}
              className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                isDisabled
                  ? "cursor-not-allowed border-gray-100 bg-gray-50 opacity-60"
                  : "border-gray-200 bg-white hover:border-secondary/50 hover:bg-secondary/5"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold transition-colors sm:h-12 sm:w-12 ${
                      isDisabled
                        ? "bg-gray-100 text-gray-400"
                        : "bg-theme-light text-dark group-hover:bg-secondary/10 group-hover:text-secondary"
                    }`}
                  >
                    {slot.day.split(",")[0]}
                  </div>
                  <div>
                    <div
                      className={`text-sm font-semibold sm:text-base ${isDisabled ? "text-gray-400" : "text-dark"}`}
                    >
                      {slot.day}
                    </div>
                    <div
                      className={`text-sm ${isDisabled ? "text-gray-400" : "text-light"}`}
                    >
                      {slot.time}
                    </div>
                  </div>
                </div>
                {getAvailabilityBadge(slot)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Step 2: Personal info
  const renderInfoStep = () => (
    <div>
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-dark sm:text-3xl">
          Your Information
        </h2>
        <p className="text-base text-light">
          Registering for{" "}
          <span className="font-medium text-secondary">
            {selectedSlot?.label}
          </span>
        </p>
      </div>
      <div className="mx-auto max-w-lg">
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
            Email Address
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
            placeholder="you@example.com"
          />
          {fieldErrors.email && (
            <p className="mt-1.5 text-xs text-red-500">{fieldErrors.email}</p>
          )}
        </div>
        <div className="mb-5">
          <label htmlFor="phone" className="form-label">
            Phone Number
          </label>
          <input
            id="phone"
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
            <p className="mt-1.5 text-xs text-red-500">{fieldErrors.phone}</p>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setStep("select");
              setError("");
              setFieldErrors({});
            }}
            className="btn btn-outline-primary inline-flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 17l-5-5m0 0l5-5m-5 5h12"
              />
            </svg>
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-base ${submitting ? "cursor-wait opacity-70" : ""}`}
          >
            {submitting ? (
              <>
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
                Registering...
              </>
            ) : (
              <>
                Register
                <svg
                  className="h-4 w-4"
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
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  // Calendar link generators
  const generateCalendarLinks = () => {
    if (!selectedSlot) return { google: "", outlook: "" };

    const title = "ThisWay Global Group Interview";
    const description =
      "Group Interview Link: [ZOOM LINK]\\n\\nThisWay Global Group Interview Session\\n\\nPlease join a few minutes early to ensure your audio and video are working properly.";
    const location = "Zoom (link will be provided)";

    // Parse the ISO date and create end time (30 min later)
    const startDate = new Date(selectedSlot.iso);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    // Format for Google Calendar (YYYYMMDDTHHmmssZ)
    const formatGoogleDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const googleStart = formatGoogleDate(startDate);
    const googleEnd = formatGoogleDate(endDate);

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${googleStart}/${googleEnd}&details=${encodeURIComponent(description.replace(/\\n/g, "\n"))}&location=${encodeURIComponent(location)}`;

    // Format for Outlook (ISO format)
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(description.replace(/\\n/g, "\n"))}&location=${encodeURIComponent(location)}`;

    return { google: googleUrl, outlook: outlookUrl };
  };

  // Step 3: Confirmation
  const renderConfirmStep = () => {
    const { google, outlook } = generateCalendarLinks();

    return (
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
          You're Registered!
        </h2>
        <p className="mx-auto mb-8 max-w-md text-base text-light">
          Your spot has been saved for the group interview. Add it to your
          calendar so you don't miss it.
        </p>
        <div className="mx-auto max-w-sm rounded-xl border border-border bg-theme-light p-5">
          <div className="mb-3 text-sm font-medium uppercase tracking-wider text-light">
            Your Interview
          </div>
          <div className="mb-1 text-lg font-semibold text-dark">
            {selectedSlot?.day}
          </div>
          <div className="text-base text-secondary">{selectedSlot?.time}</div>
        </div>

        <div className="mx-auto mt-8 max-w-sm">
          <p className="mb-4 text-sm font-medium text-dark">Add to Calendar</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href={google}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-dark transition-all hover:border-secondary/40"
            >
              <FaGoogle className="h-4 w-4 text-[#4285F4]" />
              Google Calendar
            </a>
            <a
              href={outlook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-dark transition-all hover:border-secondary/40"
            >
              <FaMicrosoft className="h-4 w-4 text-[#0078D4]" />
              Outlook
            </a>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-sm text-light">
            Need to make changes?{" "}
            <a
              href="/group-interview"
              className="font-medium text-secondary underline-offset-4 hover:underline"
            >
              Register again
            </a>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
        <StepIndicator />
        {step === "select" && renderSelectStep()}
        {step === "info" && renderInfoStep()}
        {step === "confirm" && renderConfirmStep()}
      </div>
    </div>
  );
}
