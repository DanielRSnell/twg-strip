import { useState, useEffect, useCallback, useRef } from "react";
import type { InterviewState, VideoProgress, FunnelStep } from "./types";
import { createInitialState } from "./types";

const STORAGE_PREFIX = "twg-interview";

function getStorageKey(client: string, email: string): string {
  return `${STORAGE_PREFIX}-${client}-${email.toLowerCase().trim()}`;
}

function loadState(client: string, email: string): InterviewState | null {
  try {
    const key = getStorageKey(client, email);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as InterviewState;
  } catch {
    return null;
  }
}

function saveState(client: string, state: InterviewState): void {
  try {
    const key = getStorageKey(client, state.email);
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable; non-blocking
  }
}

export function useInterviewState(client: string) {
  const [state, setState] = useState<InterviewState | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced save
  const debouncedSave = useCallback(
    (newState: InterviewState) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveState(client, newState);
      }, 500);
    },
    [client],
  );

  // Initialize or restore session from email
  const initSession = useCallback(
    (email: string): InterviewState => {
      const existing = loadState(client, email);
      if (existing) {
        setState(existing);
        return existing;
      }
      const fresh = createInitialState(email);
      saveState(client, fresh);
      setState(fresh);
      return fresh;
    },
    [client],
  );

  // Update helper that sets state and queues a save
  const update = useCallback(
    (updater: (prev: InterviewState) => InterviewState) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave],
  );

  const updateVideoProgress = useCallback(
    (progress: Partial<VideoProgress>) => {
      update((prev) => ({
        ...prev,
        videoProgress: { ...prev.videoProgress, ...progress },
      }));
    },
    [update],
  );

  const setFormAnswer = useCallback(
    (questionId: string, value: string) => {
      update((prev) => ({
        ...prev,
        formAnswers: { ...prev.formAnswers, [questionId]: value },
      }));
    },
    [update],
  );

  const setCurrentFormQuestion = useCallback(
    (index: number) => {
      update((prev) => ({
        ...prev,
        currentFormQuestion: index,
      }));
    },
    [update],
  );

  const advanceStep = useCallback(
    (step: FunnelStep) => {
      update((prev) => ({
        ...prev,
        currentStep: step,
        ...(step === "complete"
          ? { completedAt: new Date().toISOString() }
          : {}),
      }));
    },
    [update],
  );

  // Flush pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      // Final synchronous save
      if (state) saveState(client, state);
    };
  }, [client, state]);

  return {
    state,
    initSession,
    updateVideoProgress,
    setFormAnswer,
    setCurrentFormQuestion,
    advanceStep,
  };
}
