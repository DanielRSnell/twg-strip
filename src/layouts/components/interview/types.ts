export type FunnelStep = "email" | "video" | "form" | "complete" | "exited";

export interface VideoProgress {
  currentTime: number;
  maxWatchedTime: number;
  duration: number;
  completed: boolean;
}

export interface ExitConfig {
  value: string;
  heading: string;
  body: string;
}

export interface QuestionConfig {
  id: string;
  label: string;
  type: "text" | "tel" | "yesno" | "select" | "multiselect";
  required: boolean;
  placeholder?: string;
  options?: string[];
  dynamic?: "upcoming-sessions";
  disclaimer?: string;
  exitOn?: ExitConfig;
}

export interface CompletionConfig {
  heading: string;
  body: string;
  boxHeading: string;
  boxBody: string;
}

export interface ClientConfig {
  client: string;
  name: string;
  logo: string;
  title: string;
  subtitle: string;
  video: {
    src: string;
    poster?: string;
    completionThreshold: number;
  };
  questions: QuestionConfig[];
  completion?: CompletionConfig;
}

export interface InterviewState {
  email: string;
  currentStep: FunnelStep;
  videoProgress: VideoProgress;
  formAnswers: Record<string, string>;
  currentFormQuestion: number;
  completedAt: string | null;
}

export interface TrackEventPayload {
  client: string;
  email: string;
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export const INITIAL_VIDEO_PROGRESS: VideoProgress = {
  currentTime: 0,
  maxWatchedTime: 0,
  duration: 0,
  completed: false,
};

export const createInitialState = (email: string): InterviewState => ({
  email,
  currentStep: "video",
  videoProgress: { ...INITIAL_VIDEO_PROGRESS },
  formAnswers: {},
  currentFormQuestion: 0,
  completedAt: null,
});
