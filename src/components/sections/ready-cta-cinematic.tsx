"use client";
import React from "react";

interface ReadyCtaCinematicProps {
  headline: string;
  subhead: string;
  buttonText: string;
  targetUrl: string;
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
          d="M 81.22,59.37 C 76.84,59.37 73.84,57.50 73.34,55.95 L 64.28,37.00 Q 62.31,32.87 57.26,37.00 L 52.82,40.63 L 50.00,59.37 L 36.52,39.28 L 57.28,22.34 C 55.64,21.00 53.56,21.00 51.93,21.75 C 54.84,14.50 58.34,10.00 67.69,12.23 L 84.94,47.32 C 86.84,48.36 88.84,48.36 89.99,47.62 C 86.84,56.00 83.84,59.37 81.22,59.37 Z"
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

export default function ReadyCtaCinematic({
  headline,
  subhead,
  buttonText,
  targetUrl,
  lang,
}: ReadyCtaCinematicProps) {
  return (
    <section className="relative w-full max-w-5xl mx-auto text-center py-20 sm:py-32 px-4 sm:px-6 overflow-visible select-none">
      {/* Ambient Backdrop Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[36rem] sm:w-[56rem] h-[22rem] sm:h-[32rem] rounded-full bg-accent-primary/[0.04] blur-[100px]" />
      </div>

      <div className="relative space-y-10 z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-text-main/10 bg-bg-card flex items-center justify-center shadow-lg backdrop-blur-xl">
          <ReactBrandMark size={32} className="text-text-main" />
        </div>

        {/* Text content */}
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-text-main tracking-tight leading-[1.18] max-w-3xl mx-auto px-2">
            {headline}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-text-main/70 max-w-xl mx-auto leading-relaxed font-sans">
            {subhead}
          </p>
        </div>

        {/* Button */}
        <div className="pt-4">
          <a
            href={targetUrl}
            className="group relative inline-flex items-center justify-center whitespace-nowrap min-h-[52px] sm:min-h-[56px] px-10 sm:px-12 rounded-full bg-text-main hover:bg-text-main/90 text-white font-sans font-bold text-xs sm:text-sm tracking-widest uppercase shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 border border-transparent"
          >
            <span>{buttonText}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
