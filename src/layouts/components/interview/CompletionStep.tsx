import { useEffect, useRef } from "react";
import type { CompletionConfig } from "./types";

function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#5969FC", "#24ab9d", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"];
  const particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
  }[] = [];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: Math.random() * -18 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 120;

  function animate() {
    if (frame >= maxFrames) {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);
      p.vx *= 0.99;

      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate((p.rotation * Math.PI) / 180);
      ctx!.globalAlpha = p.opacity;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx!.restore();
    });

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}

function renderTextWithLinks(text: string) {
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const parts = text.split(emailRegex);
  return parts.map((part, i) =>
    emailRegex.test(part) ? (
      <a key={i} href={`mailto:${part}`} className="text-secondary hover:underline">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

interface CompletionStepProps {
  config?: CompletionConfig;
}

export default function CompletionStep({ config }: CompletionStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      launchConfetti(canvasRef.current);
    }
  }, []);

  const heading = config?.heading ?? "You're All Set!";
  const body =
    config?.body ??
    "Thank you for completing the interview process. Our team will review your responses and be in touch soon.";
  const boxHeading = config?.boxHeading ?? "WHAT HAPPENS NEXT?";
  const boxBody =
    config?.boxBody ??
    "We'll review your responses and reach out via email or text with next steps. Keep an eye on your inbox.";

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50"
        style={{ width: "100vw", height: "100vh" }}
      />

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
          {heading}
        </h2>
        <div className="mx-auto mb-6 max-w-md text-base text-light">
          {body.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {renderTextWithLinks(line)}
            </p>
          ))}
        </div>

        <div className="mx-auto max-w-sm rounded-xl border border-border bg-theme-light p-5">
          <div className="mb-2 text-sm font-medium uppercase tracking-wider text-light">
            {boxHeading}
          </div>
          <div className="text-sm text-dark">
            {boxBody.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>
                {renderTextWithLinks(line)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
