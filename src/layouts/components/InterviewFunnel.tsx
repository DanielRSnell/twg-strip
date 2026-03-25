import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ClientConfig, FunnelStep, TrackEventPayload } from "./interview/types";
import { useInterviewState } from "./interview/useInterviewState";
import ProgressBar from "./interview/ProgressBar";
import EmailStep from "./interview/EmailStep";
import VideoStep from "./interview/VideoStep";
import FormStep from "./interview/FormStep";
import CompletionStep from "./interview/CompletionStep";

const TRACKING_URL = "https://api.umbral.ai/webhook/interview-tracking";

interface InterviewFunnelProps {
  config: ClientConfig;
}

const stepTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export default function InterviewFunnel({ config }: InterviewFunnelProps) {
  const {
    state,
    initSession,
    updateVideoProgress,
    setFormAnswer,
    setCurrentFormQuestion,
    advanceStep,
  } = useInterviewState(config.client);

  const trackEvent = useCallback(
    (event: string, data: Record<string, unknown> = {}) => {
      if (!state?.email) return;
      const payload: TrackEventPayload = {
        client: config.client,
        email: state.email,
        event,
        timestamp: new Date().toISOString(),
        data,
      };
      // Fire and forget
      fetch(TRACKING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    },
    [config.client, state?.email],
  );

  const currentStep: FunnelStep = state?.currentStep ?? "email";

  const handleEmailSubmit = useCallback(
    (email: string) => {
      const restored = initSession(email);
      // Fire tracking event for email submission
      const payload: TrackEventPayload = {
        client: config.client,
        email,
        event: "email_submitted",
        timestamp: new Date().toISOString(),
        data: {},
      };
      fetch(TRACKING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
      // If returning user, they'll land on their saved step
      // If new user, they start at "video" (set by createInitialState)
      return restored;
    },
    [initSession, config.client],
  );

  const handleVideoComplete = useCallback(() => {
    trackEvent("video_completed", {
      duration: state?.videoProgress.duration ?? 0,
    });
    advanceStep("form");
    trackEvent("form_started");
  }, [trackEvent, advanceStep, state?.videoProgress.duration]);

  const handleFormComplete = useCallback(
    (answers: Record<string, string>) => {
      trackEvent("form_completed", { answers });
      trackEvent("funnel_completed", {
        completedAt: new Date().toISOString(),
      });
      advanceStep("complete");
    },
    [trackEvent, advanceStep],
  );

  const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

  const handleClearStorage = () => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("twg-interview-"));
    keys.forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      {isDev && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleClearStorage}
            className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-200"
          >
            Clear Storage (dev)
          </button>
        </div>
      )}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10">
        <ProgressBar currentStep={currentStep} />
        <AnimatePresence mode="wait">
          {currentStep === "email" && (
            <motion.div key="email" {...stepTransition}>
              <EmailStep onSubmit={handleEmailSubmit} />
            </motion.div>
          )}
          {currentStep === "video" && state && (
            <motion.div key="video" {...stepTransition}>
              <VideoStep
                config={config}
                videoProgress={state.videoProgress}
                onUpdateProgress={updateVideoProgress}
                onComplete={handleVideoComplete}
                trackEvent={trackEvent}
              />
            </motion.div>
          )}
          {currentStep === "form" && state && (
            <motion.div key="form" {...stepTransition}>
              <FormStep
                questions={config.questions}
                answers={state.formAnswers}
                currentQuestion={state.currentFormQuestion}
                onAnswer={setFormAnswer}
                onQuestionChange={setCurrentFormQuestion}
                onComplete={handleFormComplete}
                trackEvent={trackEvent}
              />
            </motion.div>
          )}
          {currentStep === "complete" && (
            <motion.div key="complete" {...stepTransition}>
              <CompletionStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
