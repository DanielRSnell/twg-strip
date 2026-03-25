import { useRef, useState, useEffect, useCallback } from "react";
import type { ClientConfig, VideoProgress } from "./types";

interface VideoStepProps {
  config: ClientConfig;
  videoProgress: VideoProgress;
  onUpdateProgress: (progress: Partial<VideoProgress>) => void;
  onComplete: () => void;
  trackEvent: (event: string, data?: Record<string, unknown>) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoStep({
  config,
  videoProgress,
  onUpdateProgress,
  onComplete,
  trackEvent,
}: VideoStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(videoProgress.currentTime);
  const [duration, setDuration] = useState(videoProgress.duration);
  const [maxWatched, setMaxWatched] = useState(videoProgress.maxWatchedTime);
  const [isCompleted, setIsCompleted] = useState(videoProgress.completed);
  const [hasStarted, setHasStarted] = useState(false);
  const [showResumeMsg, setShowResumeMsg] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTrackProgressRef = useRef(0);
  const isSeekingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  // Use refs for values read in high-frequency callbacks to avoid stale closures
  const maxWatchedRef = useRef(maxWatched);
  const isCompletedRef = useRef(isCompleted);
  const hasStartedRef = useRef(hasStarted);
  const lastSaveTimeRef = useRef(-1);

  // Keep refs in sync
  useEffect(() => { maxWatchedRef.current = maxWatched; }, [maxWatched]);
  useEffect(() => { isCompletedRef.current = isCompleted; }, [isCompleted]);
  useEffect(() => { hasStartedRef.current = hasStarted; }, [hasStarted]);

  // Smooth rAF loop for progress bar updates
  useEffect(() => {
    const tick = () => {
      const video = videoRef.current;
      if (video && !video.paused && !isSeekingRef.current) {
        const ct = video.currentTime;
        const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        setCurrentTime(ct);
        if (dur > 0) setDuration(dur);
        const newMax = Math.max(maxWatchedRef.current, ct);
        if (newMax > maxWatchedRef.current) {
          setMaxWatched(newMax);
          maxWatchedRef.current = newMax;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Also try to get duration from durationchange event (fires when duration becomes known)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onDurationChange = () => {
      if (isFinite(video.duration) && video.duration > 0) {
        setDuration(video.duration);
        onUpdateProgress({ duration: video.duration });
      }
    };
    video.addEventListener("durationchange", onDurationChange);
    return () => video.removeEventListener("durationchange", onDurationChange);
  }, [onUpdateProgress]);

  // Restore position when video metadata loads
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isFinite(video.duration) && video.duration > 0) {
      setDuration(video.duration);
      onUpdateProgress({ duration: video.duration });
    }

    if (videoProgress.currentTime > 0) {
      video.currentTime = videoProgress.currentTime;
      setShowResumeMsg(true);
      setTimeout(() => setShowResumeMsg(false), 3000);
    }
  }, [videoProgress.currentTime, onUpdateProgress]);

  // Core time tracking
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSeekingRef.current) return;

    const ct = video.currentTime;
    const dur = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;

    // Update duration state if we now have it
    if (dur > 0) {
      setDuration(dur);
    }

    setCurrentTime(ct);

    // Update max watched using ref for current value
    const prevMax = maxWatchedRef.current;
    const newMax = Math.max(prevMax, ct);
    if (newMax > prevMax) {
      setMaxWatched(newMax);
      maxWatchedRef.current = newMax;
    }

    // Save progress every 5 seconds of playback
    const flooredCt = Math.floor(ct);
    if (flooredCt % 5 === 0 && flooredCt !== lastSaveTimeRef.current) {
      lastSaveTimeRef.current = flooredCt;
      onUpdateProgress({
        currentTime: ct,
        maxWatchedTime: newMax,
        duration: dur,
      });
    }

    // Track progress event every 30 seconds
    if (ct - lastTrackProgressRef.current >= 30) {
      lastTrackProgressRef.current = ct;
      trackEvent("video_progress", {
        currentTime: Math.round(ct),
        duration: Math.round(dur),
        percentComplete: dur > 0 ? Math.round((newMax / dur) * 100) : 0,
      });
    }

    // Completion check
    if (dur > 0 && !isCompletedRef.current) {
      const threshold = config.video.completionThreshold;
      if (newMax / dur >= threshold) {
        setIsCompleted(true);
        isCompletedRef.current = true;
        onUpdateProgress({ completed: true, maxWatchedTime: newMax });
      }
    }
  }, [config.video.completionThreshold, onUpdateProgress, trackEvent]);

  // No-skip enforcement
  const handleSeeking = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const currentMax = maxWatchedRef.current;
    if (video.currentTime > currentMax + 1) {
      isSeekingRef.current = true;
      video.currentTime = currentMax;
      setTimeout(() => {
        isSeekingRef.current = false;
      }, 50);
    }
  }, []);

  // Play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      if (!hasStartedRef.current) {
        setHasStarted(true);
        hasStartedRef.current = true;
        trackEvent("video_started");
      }
    } else {
      video.pause();
    }
  }, [trackEvent]);

  // Progress bar click to seek (only within watched range)
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const bar = progressBarRef.current;
      if (!video || !bar || !duration) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = ratio * duration;

      // Only allow seeking within watched range
      if (targetTime <= maxWatched) {
        video.currentTime = targetTime;
        setCurrentTime(targetTime);
      }
    },
    [duration, maxWatched],
  );

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  const percentWatched = duration > 0 ? Math.round((maxWatched / duration) * 100) : 0;
  const percentCurrent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const percentMaxWatched = duration > 0 ? (maxWatched / duration) * 100 : 0;

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-semibold text-dark sm:text-3xl">
          Watch the Interview Video
        </h2>
        <p className="text-base text-light">
          Please watch the full video before proceeding to the questions.
        </p>
      </div>

      {/* Video container */}
      <div
        className="group relative mx-auto overflow-hidden rounded-xl bg-black"
        onMouseMove={resetControlsTimeout}
        onTouchStart={resetControlsTimeout}
      >
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            className="h-full w-full"
            playsInline
            preload="metadata"
            poster={config.video.poster || undefined}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src={config.video.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Resume message toast */}
          {showResumeMsg && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-black/70 px-4 py-2 text-sm text-white backdrop-blur-sm">
              Resuming from where you left off
            </div>
          )}

          {/* Big play button overlay (when paused) */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110 sm:h-20 sm:w-20">
                <svg
                  className="ml-1 h-8 w-8 text-dark sm:h-10 sm:w-10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          )}

          {/* Bottom controls bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="group/bar relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/20"
              onClick={handleProgressClick}
            >
              {/* Watched range (seekable) */}
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-white/30"
                style={{ width: `${percentMaxWatched}%` }}
              />
              {/* Current playback position */}
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-secondary"
                style={{ width: `${percentCurrent}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow group-hover/bar:opacity-100"
                style={{ left: `${percentCurrent}%` }}
              />
              {/* Locked indicator (dimmed area beyond max watched) */}
              {percentMaxWatched < 100 && (
                <div
                  className="absolute right-0 top-0 flex h-full items-center justify-end rounded-r-full"
                  style={{ width: `${100 - percentMaxWatched}%` }}
                >
                  <svg
                    className="mr-1 h-2.5 w-2.5 text-white/40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/20"
                >
                  {isPlaying ? (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <span className="text-xs font-medium tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="text-xs font-medium">
                {percentWatched}% watched
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion / Continue */}
      <div className="mt-6 text-center">
        {isCompleted ? (
          <button
            onClick={onComplete}
            className="btn btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
          >
            Continue to Questions
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
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        ) : (
          <p className="text-sm text-light">
            {percentWatched > 0
              ? `${percentWatched}% complete. Keep watching to unlock the next step.`
              : "Press play to begin watching the interview video."}
          </p>
        )}
      </div>
    </div>
  );
}
