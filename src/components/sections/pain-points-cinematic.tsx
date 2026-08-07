"use client";
import React, { useEffect, useRef, useState } from "react";

interface PainPointsCinematicProps {
  title: string;
  whatsappText: string;
  whatsappUrl: string;
  lang: "en" | "ar";
}

// Brand Mark SVG Component
function ReactBrandMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block align-middle text-current ${className}`}
      fill="none"
      role="img"
      aria-label="Mousa Analytics Brand Mark"
    >
      <title>Mousa Analytics Brand Mark</title>
      <g transform="translate(2.5, 12.5) scale(0.95)" fill="currentColor">
        <path
          d="M 21.5,59.5 C 16.5,59.5 13.0,55.0 12.0,49.0 C 11.0,43.0 14.0,37.0 18.0,37.5 C 22.0,38.0 25.0,44.0 27.5,48.0 C 30.0,52.0 26.5,59.5 21.5,59.5 Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M 52.38,59.37 C 48.00,59.37 45.00,57.50 44.50,55.95 L 28.44,22.34 C 26.80,21.00 24.72,21.00 23.09,21.75 C 26.00,14.50 29.50,10.00 32.16,10.00 C 34.83,10.00 37.00,11.00 38.85,12.23 L 56.10,47.32 C 58.00,48.36 60.00,48.36 61.15,47.62 C 58.00,56.00 55.00,59.37 52.38,59.37 Z M 45.62,26.00 Q 47.67,30.16 52.79,26.00 L 52.79,35.00 L 45.62,35.00 Z"
          fill="currentColor"
        />
        <path
          d="M 81.22,59.37 C 76.84,59.37 73.84,57.50 73.34,55.95 L 64.28,37.00 Q 62.31,32.87 57.26,37.00 L 52.82,40.63 L 50.00,59.37 L 36.52,39.28 L 57.28,22.34 C 55.64,21.00 53.56,21.00 51.93,21.75 C 54.84,14.50 58.34,10.00 61.00,10.00 C 63.67,10.00 65.84,11.00 67.69,12.23 L 84.94,47.32 C 86.84,48.36 88.84,48.36 89.99,47.62 C 86.84,56.00 83.84,59.37 81.22,59.37 Z"
          fill="currentColor"
        />
        <path
          d="M 19.80,48.50 L 53.98,43.00 L 82.82,43.00"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
        <circle cx="19.80" cy="48.50" r="3" fill="currentColor" />
        <circle cx="53.98" cy="43.00" r="3" fill="currentColor" />
        <circle cx="82.82" cy="43.00" r="3" fill="currentColor" />
      </g>
    </svg>
  );
}

export default function PainPointsCinematicSection({
  title,
  whatsappText,
  whatsappUrl,
  lang,
}: PainPointsCinematicProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [animProgress, setAnimProgress] = useState(0); // 0 to 1
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShaken, setIsShaken] = useState(false);

  // Scroll Trigger Observer
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      setHasTriggered(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasTriggered(true);
      setIsCompleted(true);
      setAnimProgress(1);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasTriggered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Cinematic Logo Circular Orbit & Scale Motion Choreography
  useEffect(() => {
    if (!hasTriggered) return;

    const startTime = performance.now();
    const duration = 3200; // 3.2 seconds slow motion cinematic circular sweep

    const animateFrame = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth cinematic easeInOutCubic
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setAnimProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animateFrame);
      } else {
        setIsCompleted(true);
      }
    };

    requestAnimationFrame(animateFrame);
  }, [hasTriggered]);

  // Periodic Cinematic Shaken Alive Micro-Vibration
  useEffect(() => {
    if (!isCompleted) return;

    const shakeInterval = setInterval(() => {
      setIsShaken(true);
      setTimeout(() => setIsShaken(false), 450);
    }, 4500);

    return () => clearInterval(shakeInterval);
  }, [isCompleted]);

  // Calculate Logo Orbital 3D Coordinates & Scale:
  // Starts +90% bigger (scale 1.90), circles around section, shrinks back to 1.00 at center home position!
  const angle = (1 - animProgress) * Math.PI * 2;
  const radiusX = 220 * (1 - animProgress); // orbital horizontal path
  const radiusY = 90 * (1 - animProgress);  // orbital vertical depth path
  
  const logoX = Math.sin(angle) * radiusX;
  const logoY = -Math.cos(angle) * radiusY - 30 * (1 - animProgress);
  const logoScale = 1.0 + 0.9 * (1 - animProgress); // Starts at 1.90 (+90% bigger) -> shrinks to 1.00

  // 3D Breaking 4th Wall Component Gathering (Title & CTA)
  const componentOpacity = Math.min(1, Math.max(0, (animProgress - 0.25) / 0.65));
  const componentY = (1 - animProgress) * 45;
  const componentScale = 0.92 + animProgress * 0.08;

  return (
    <section
      ref={sectionRef}
      id="pain-points"
      aria-labelledby="pain-points-title"
      className="relative py-24 sm:py-36 px-4 sm:px-6 overflow-visible scroll-mt-20 select-none [perspective:1200px]"
    >
      {/* Ambient Lighting Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[32rem] sm:w-[46rem] h-[20rem] sm:h-[26rem] rounded-full bg-accent-primary/[0.06] blur-[110px]" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center space-y-8 sm:space-y-10 z-10 [transform-style:preserve-3d]">
        {/* ─── Cinematic Orbital Logo Box ────────────────────────────────────────── */}
        <div className="relative h-16 flex items-center justify-center pointer-events-none">
          <div
            className={[
              "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-text-main/20 bg-bg-card text-text-main flex items-center justify-center shadow-[0_12px_32px_rgba(10,25,47,0.10)] backdrop-blur-xl transition-transform duration-75",
              isShaken ? "animate-shaken-pulse border-accent-primary/60 shadow-[0_0_25px_rgba(37,99,235,0.4)]" : "",
            ].join(" ")}
            style={{
              transform: `translate3d(${logoX}px, ${logoY}px, 20px) scale(${logoScale}) ${
                isShaken ? "rotate(3deg)" : "rotate(0deg)"
              }`,
            }}
          >
            <ReactBrandMark size={32} className="w-8 h-8 sm:w-9 sm:h-9 text-text-main" />
          </div>
        </div>

        {/* ─── 3D Gathered Component Group (Title + Single Primary WhatsApp CTA) ───── */}
        <div
          className="space-y-8 transition-all duration-500 ease-out [transform-style:preserve-3d]"
          style={{
            opacity: isCompleted ? 1 : componentOpacity,
            transform: isCompleted
              ? "none"
              : `translate3d(0, ${componentY}px, 0) scale(${componentScale})`,
          }}
        >
          {/* Main Display Heading */}
          <h2
            id="pain-points-title"
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-text-main tracking-tight leading-[1.15] max-w-3xl mx-auto px-2 [transform:translateZ(30px)]"
          >
            {title}
          </h2>

          {/* Single Primary WhatsApp Pill Button (Strictly ONE CTA Button) */}
          <div className="pt-2 sm:pt-4 flex items-center justify-center w-full mx-auto [transform:translateZ(45px)]">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center whitespace-nowrap min-h-[52px] sm:min-h-[56px] px-9 sm:px-11 rounded-full bg-text-main hover:bg-text-main/90 text-white font-sans font-bold text-xs sm:text-sm tracking-widest uppercase shadow-[0_14px_35px_rgba(10,25,47,0.18)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.30)] transition-all duration-300 cursor-pointer active:scale-95 gap-3 border border-white/10"
            >
              {/* WhatsApp Icon */}
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current text-white shrink-0 group-hover:scale-110 transition-transform duration-300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{whatsappText}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
