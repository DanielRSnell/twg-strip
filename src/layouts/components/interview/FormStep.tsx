import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { QuestionConfig } from "./types";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getUpcomingSessionOptions(): string[] {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();
  const year = now.getFullYear();
  const isEarly = day <= 15;

  const slots: string[] = [];
  let m = month;
  let y = year;
  let startWithLate = !isEarly;

  for (let i = 0; slots.length < 4; i++) {
    if (i === 0 && startWithLate) {
      slots.push(`Late ${MONTH_NAMES[m]}`);
    } else if (i === 0 && !startWithLate) {
      slots.push(`Early ${MONTH_NAMES[m]}`);
      slots.push(`Late ${MONTH_NAMES[m]}`);
    } else {
      slots.push(`Early ${MONTH_NAMES[m]}`);
      if (slots.length < 4) slots.push(`Late ${MONTH_NAMES[m]}`);
    }
    m++;
    if (m > 11) { m = 0; y++; }
  }

  return [...slots.slice(0, 4), "Flexible"];
}

interface FormStepProps {
  questions: QuestionConfig[];
  answers: Record<string, string>;
  currentQuestion: number;
  onAnswer: (questionId: string, value: string) => void;
  onQuestionChange: (index: number) => void;
  onComplete: (answers: Record<string, string>) => void;
  onExit: (question: QuestionConfig, answers: Record<string, string>) => void;
  trackEvent: (event: string, data?: Record<string, unknown>) => void;
}

const questionVariants = {
  enter: { opacity: 0, y: 40 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -40 },
};

const questionTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

export default function FormStep({
  questions,
  answers,
  currentQuestion,
  onAnswer,
  onQuestionChange,
  onComplete,
  onExit,
  trackEvent,
}: FormStepProps) {
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [localValue, setLocalValue] = useState("");
  const [error, setError] = useState("");
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const rawQuestion = questions[currentQuestion];
  const dynamicSessionOptions = useMemo(() => getUpcomingSessionOptions(), []);
  const question = useMemo(() => {
    if (rawQuestion.dynamic === "upcoming-sessions") {
      return { ...rawQuestion, options: dynamicSessionOptions };
    }
    return rawQuestion;
  }, [rawQuestion, dynamicSessionOptions]);
  const isLast = currentQuestion === questions.length - 1;
  const totalQuestions = questions.length;

  // Track form_started on first render
  useEffect(() => {
    if (!hasTrackedStart) {
      trackEvent("form_started");
      setHasTrackedStart(true);
    }
  }, [hasTrackedStart, trackEvent]);

  // Sync local value with stored answer when question changes
  useEffect(() => {
    if (question) {
      setLocalValue(answers[question.id] || "");
      setError("");
    }
  }, [currentQuestion, question, answers]);

  // Auto-focus text inputs
  useEffect(() => {
    if (question?.type === "text" || question?.type === "tel") {
      // Small delay for animation to start
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [currentQuestion, question?.type]);

  const validate = useCallback((): boolean => {
    if (!question.required && !localValue.trim()) return true;
    if (question.required && !localValue.trim()) {
      setError(question.type === "multiselect" ? "Please select at least one option" : "This field is required");
      return false;
    }
    if (question.type === "tel" && !/^[\d\s\-+().]{7,}$/.test(localValue)) {
      setError("Please enter a valid phone number");
      return false;
    }
    return true;
  }, [question, localValue]);

  const goNext = useCallback(() => {
    if (!validate()) return;

    const trimmed = localValue.trim();

    // Save answer
    onAnswer(question.id, trimmed);

    // Track progress
    trackEvent("form_progress", {
      questionId: question.id,
      questionIndex: currentQuestion,
      totalQuestions,
    });

    // Check for exit condition
    if (question.exitOn && trimmed === question.exitOn.value) {
      const finalAnswers = { ...answers, [question.id]: trimmed };
      onExit(question, finalAnswers);
      return;
    }

    if (isLast) {
      // Submit the form
      const finalAnswers = { ...answers, [question.id]: trimmed };
      onComplete(finalAnswers);
    } else {
      setDirection(1);
      onQuestionChange(currentQuestion + 1);
    }
  }, [
    validate,
    question,
    localValue,
    currentQuestion,
    isLast,
    answers,
    totalQuestions,
    onAnswer,
    onQuestionChange,
    onComplete,
    onExit,
    trackEvent,
  ]);

  const goBack = useCallback(() => {
    if (currentQuestion === 0) return;
    // Save current answer before going back
    if (localValue.trim()) {
      onAnswer(question.id, localValue.trim());
    }
    setDirection(-1);
    onQuestionChange(currentQuestion - 1);
  }, [currentQuestion, localValue, question, onAnswer, onQuestionChange]);

  // Handle Enter key for text/tel fields
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
      }
    },
    [goNext],
  );

  // For yesno: set value and require Next click
  const handleYesNo = (value: string) => {
    setLocalValue(value);
    onAnswer(question.id, value);
  };

  // For select: set value and require Next click
  const handleSelect = (value: string) => {
    setLocalValue(value);
    onAnswer(question.id, value);
  };

  // For multiselect: toggle values
  const handleMultiSelect = (value: string) => {
    const current = localValue ? localValue.split(", ").filter(Boolean) : [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const joined = updated.join(", ");
    setLocalValue(joined);
    onAnswer(question.id, joined);
  };

  const progressPercent = ((currentQuestion + 1) / totalQuestions) * 100;

  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "tel":
        return (
          <input
            ref={inputRef}
            type={question.type === "tel" ? "tel" : "text"}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            className={`form-input w-full bg-tertiary/5 py-4 text-center text-lg ${error ? "!border-red-400" : ""}`}
            placeholder={question.placeholder || "Type your answer..."}
          />
        );

      case "yesno":
        return (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleYesNo("Yes")}
              className={`flex-1 rounded-xl border-2 px-6 py-4 text-lg font-medium transition-all ${
                localValue === "Yes"
                  ? "border-secondary bg-secondary/5 text-secondary"
                  : "border-gray-200 text-dark hover:border-secondary/40 hover:bg-secondary/5"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleYesNo("No")}
              className={`flex-1 rounded-xl border-2 px-6 py-4 text-lg font-medium transition-all ${
                localValue === "No"
                  ? "border-secondary bg-secondary/5 text-secondary"
                  : "border-gray-200 text-dark hover:border-secondary/40 hover:bg-secondary/5"
              }`}
            >
              No
            </button>
          </div>
        );

      case "select":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full rounded-xl border-2 px-5 py-3.5 text-left text-base font-medium transition-all ${
                  localValue === option
                    ? "border-secondary bg-secondary/5 text-secondary"
                    : "border-gray-200 text-dark hover:border-secondary/40 hover:bg-secondary/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );

      case "multiselect": {
        const selected = localValue ? localValue.split(", ").filter(Boolean) : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleMultiSelect(option)}
                className={`w-full rounded-xl border-2 px-5 py-3.5 text-left text-base font-medium transition-all ${
                  selected.includes(option)
                    ? "border-secondary bg-secondary/5 text-secondary"
                    : "border-gray-200 text-dark hover:border-secondary/40 hover:bg-secondary/5"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Question counter and progress */}
      <div className="mb-8 text-center">
        <span className="text-sm font-medium text-light">
          Question {currentQuestion + 1} of {totalQuestions}
        </span>
        <div className="mx-auto mt-2 h-1 w-48 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-secondary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mx-auto max-w-lg" style={{ minHeight: "280px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, y: d > 0 ? 40 : -40 }),
              center: { opacity: 1, y: 0 },
              exit: (d: number) => ({ opacity: 0, y: d > 0 ? -40 : 40 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={questionTransition}
          >
            <h3 className="mb-8 text-center text-xl font-semibold text-dark sm:text-2xl">
              {question.label}
            </h3>

            {renderInput()}

            {error && (
              <p className="mt-2 text-center text-sm text-red-500">{error}</p>
            )}

            {question.disclaimer && (
              <p className="mt-3 text-center text-xs leading-relaxed text-gray-400">
                {question.disclaimer}
              </p>
            )}

            {!question.required && (
              <p className="mt-2 text-center text-xs text-light">
                Optional. Press {isLast ? "Submit" : "Next"} to skip.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          onClick={goBack}
          disabled={currentQuestion === 0}
          className={`btn btn-outline-primary inline-flex items-center gap-2 ${
            currentQuestion === 0 ? "invisible" : ""
          }`}
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
          onClick={goNext}
          className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
        >
          {isLast ? "Submit" : "Next"}
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
              d={isLast ? "M5 13l4 4L19 7" : "M13 7l5 5m0 0l-5 5m5-5H6"}
            />
          </svg>
        </button>
      </div>

      {/* Keyboard hint */}
      {(question.type === "text" || question.type === "tel") && (
        <p className="mt-4 text-center text-xs text-gray-400">
          Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">Enter</kbd> to continue
        </p>
      )}
    </div>
  );
}
