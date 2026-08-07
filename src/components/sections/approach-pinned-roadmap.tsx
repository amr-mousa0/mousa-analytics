"use client";
import React, { useEffect, useRef, useState } from "react";

interface PillarItem {
  number: string;
  title: string;
  desc: string;
}

interface ApproachPinnedRoadmapProps {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  subhead: string;
  pillars: PillarItem[];
  lang?: "en" | "ar";
}

// Canonical Thumbtack Pin SVG Shape
function PushPinSVG({
  colorClass,
  isPinned,
  pinRef,
}: {
  colorClass: string;
  isPinned: boolean;
  pinRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={pinRef}
      className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-md"
    >
      <svg
        viewBox="0 0 24 24"
        className={[
          `w-6 h-6 ${colorClass} transition-all duration-400`,
          isPinned ? "scale-100 opacity-100" : "scale-150 -translate-y-2 opacity-0",
        ].join(" ")}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1.03 3 1.03-3v-7H19v-2c-1.66 0-3-1.34-3-3z" />
      </svg>
    </div>
  );
}

export default function ApproachPinnedRoadmap({
  eyebrow,
  titlePrefix,
  titleHighlight,
  subhead,
  pillars,
  lang = "ar",
}: ApproachPinnedRoadmapProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number }[] | null>(null);

  const [hasTriggered, setHasTriggered] = useState(false);
  const [textVisible, setTextVisible] = useState(false);
  const [visibleCardsCount, setVisibleCardsCount] = useState(0); // 0 to 3
  const [line1Progress, setLine1Progress] = useState(0); // 0 to 1
  const [line2Progress, setLine2Progress] = useState(0); // 0 to 1

  // Color schemes & portal energy glows for the 3 Pinned Note Cards
  const colorSchemes = [
    {
      pin: "text-[#1D4ED8]",
      numText: "text-[#1D4ED8] dark:text-blue-400",
      innerBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/30",
      rotation: "-rotate-2 sm:-rotate-3 group-hover:rotate-0",
      portalRing: "hidden",
    },
    {
      pin: "text-[#1D4ED8]",
      numText: "text-[#1D4ED8] dark:text-blue-400",
      innerBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/30",
      rotation: "rotate-2 sm:rotate-3 group-hover:rotate-0",
      portalRing: "hidden",
    },
    {
      pin: "text-[#1D4ED8]",
      numText: "text-[#1D4ED8] dark:text-blue-400",
      innerBg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200/70 dark:border-blue-500/30",
      rotation: "-rotate-2 sm:-rotate-3 group-hover:rotate-0",
      portalRing: "hidden",
    },
  ];

  // Measure exact pin coordinates for pixel-perfect rope anchoring across all screen sizes
  const updatePinCoords = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) return;

    const coords = pinRefs.current.map((pinEl) => {
      if (!pinEl) return null;
      const rect = pinEl.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
      };
    });

    if (coords.length === 3 && coords.every((c): c is { x: number; y: number } => c !== null)) {
      setPinCoords(coords);
    }
  };

  useEffect(() => {
    updatePinCoords();
    window.addEventListener("resize", updatePinCoords);
    return () => window.removeEventListener("resize", updatePinCoords);
  }, []);

  // Re-measure pin coordinates as cards emerge and settle
  useEffect(() => {
    if (!hasTriggered) return;
    const timers = [
      setTimeout(updatePinCoords, 300),
      setTimeout(updatePinCoords, 1300),
      setTimeout(updatePinCoords, 2800),
      setTimeout(updatePinCoords, 4300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hasTriggered, visibleCardsCount]);

  // Strict Scroll Trigger Observer (ONLY triggers when user actively scrolls section into view)
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasTriggered(true);
      setTextVisible(true);
      setVisibleCardsCount(3);
      setLine1Progress(1);
      setLine2Progress(1);
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
      {
        threshold: 0.30, // Requires 30% of section visible in viewport before starting!
        rootMargin: "0px 0px -50px 0px", // Strict scroll threshold
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Master Synchronized Timeline (Cards land first, THEN elegant dashed line draws)
  useEffect(() => {
    if (!hasTriggered) return;

    // Step 0: Trigger Ultra Slow easeOutBack entrance for text
    setTextVisible(true);

    // Step 1: Card 01 emerges out of portal (at 1.0s)
    const t0 = setTimeout(() => {
      setVisibleCardsCount(1);
    }, 1000);

    // Step 2: Card 02 emerges out of portal (at 2.1s)
    const t1 = setTimeout(() => {
      setVisibleCardsCount(2);
    }, 2100);

    // Step 3: Card 03 emerges out of portal (at 3.2s)
    const t2 = setTimeout(() => {
      setVisibleCardsCount(3);
    }, 3200);

    // Step 4: AFTER all cards have landed (at 4.3s), draw Line 1 (Pin 1 -> Pin 2)
    const t3 = setTimeout(() => {
      setLine1Progress(1);
    }, 4300);

    // Step 5: Draw Line 2 (Pin 2 -> Pin 3) (at 5.1s)
    const t4 = setTimeout(() => {
      setLine2Progress(1);
    }, 5100);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [hasTriggered]);

  // Calculate dynamic curved rope paths with organic gravity sag physics
  const p1 = pinCoords?.[0];
  const p2 = pinCoords?.[1];
  const p3 = pinCoords?.[2];

  let path1D = "M 130 25 Q 250 95, 360 190";
  if (p1 && p2) {
    const midX = (p1.x + p2.x) / 2;
    const sagY = Math.max(p1.y, p2.y) + 32;
    path1D = `M ${p1.x} ${p1.y} Q ${midX} ${sagY}, ${p2.x} ${p2.y}`;
  }

  let path2D = "M 360 190 Q 240 325, 130 400";
  if (p2 && p3) {
    const midX = (p2.x + p3.x) / 2;
    const sagY = Math.max(p2.y, p3.y) + 32;
    path2D = `M ${p2.x} ${p2.y} Q ${midX} ${sagY}, ${p3.x} ${p3.y}`;
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-6 overflow-visible [perspective:1200px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[36%_64%] gap-10 lg:gap-14 items-center [transform-style:preserve-3d]">
        {/* Left Column: Section Header with Ultra-Slow Cinema-Grade easeOutBack Entrance */}
        <div className="space-y-4 lg:self-center py-4 lg:py-8 [transform-style:preserve-3d]">
          {/* Eyebrow with ultra-slow easeOutBack spring overshoot */}
          <div
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translate3d(0, 0, 0)" : "translate3d(-120px, 0, 0)",
              transition: "transform 2200ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 1800ms ease",
              willChange: "transform, opacity",
            }}
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-accent-primary uppercase font-sans inline-block">
              {eyebrow}
            </span>
          </div>

          {/* Title with staggered ultra-slow easeOutBack spring overshoot */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-text-main leading-[1.18] font-serif"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translate3d(0, 0, 0)" : "translate3d(-160px, 0, 0)",
              transition: "transform 2500ms cubic-bezier(0.34, 1.56, 0.64, 1) 400ms, opacity 2000ms ease 400ms",
              willChange: "transform, opacity",
            }}
          >
            {titlePrefix}
            <span className={`text-hero-ice-blue font-bold block sm:inline ms-1 ${lang === 'en' ? 'italic' : ''}`}>
              {titleHighlight}
            </span>
          </h2>

          {/* Subhead with staggered ultra-slow easeOutBack spring overshoot */}
          <p
            className="text-sm text-text-main/70 font-sans leading-relaxed max-w-sm pt-1"
            style={{
              opacity: textVisible ? 1 : 0,
              transform: textVisible ? "translate3d(0, 0, 0)" : "translate3d(-110px, 35px, 0)",
              transition: "transform 2800ms cubic-bezier(0.34, 1.56, 0.64, 1) 800ms, opacity 2200ms ease 800ms",
              willChange: "transform, opacity",
            }}
          >
            {subhead}
          </p>
        </div>

        {/* Right Column: Pinned Notes Board with Perpetual Data-Flow Dashed Thread */}
        <div
          ref={containerRef}
          className="relative w-full flex flex-col space-y-6 sm:space-y-8 py-2 [transform-style:preserve-3d]"
        >
          {/* Clean Dashed Line (Appears AFTER cards land) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
            <svg className="w-full h-full overflow-visible">
              {/* Line 1: Pin 1 -> Pin 2 */}
              <path
                d={path1D}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                style={{
                  opacity: line1Progress > 0 ? 0.5 : 0,
                  transition: "opacity 600ms ease",
                }}
              />

              {/* Line 2: Pin 2 -> Pin 3 */}
              <path
                d={path2D}
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2.4"
                strokeDasharray="8 6"
                strokeLinecap="round"
                style={{
                  opacity: line2Progress > 0 ? 0.5 : 0,
                  transition: "opacity 600ms ease",
                }}
              />

              {/* Pin Anchor Nodes */}
              {p1 && line1Progress > 0 && (
                <circle cx={p1.x} cy={p1.y} r="3.5" fill="#1D4ED8" />
              )}
              {p2 && (line1Progress > 0 || line2Progress > 0) && (
                <circle cx={p2.x} cy={p2.y} r="3.5" fill="#1D4ED8" />
              )}
              {p3 && line2Progress > 0 && (
                <circle cx={p3.x} cy={p3.y} r="3.5" fill="#1D4ED8" />
              )}
            </svg>
          </div>

          {/* Staggered Pinned Cards with Accelerated Crisp Portal Entrance */}
          {pillars.map((pillar, idx) => {
            const scheme = colorSchemes[idx % colorSchemes.length];
            const isRight = idx % 2 === 1;
            const isCardVisible = visibleCardsCount > idx;

            return (
              <div
                key={idx}
                className={[
                  "group relative z-10 w-[85%] sm:w-[270px] md:w-[290px] transition-all duration-500 ease-out [transform-style:preserve-3d]",
                  isRight
                    ? "ms-auto me-2 sm:me-8" // Card 02 aligned Right
                    : "ms-2 sm:ms-4 me-auto", // Card 01 & 03 aligned Left
                ].join(" ")}
                style={{
                  opacity: isCardVisible ? 1 : 0,
                  transform: isCardVisible
                    ? "scale(1) translateY(0)"
                    : "scale(0.95) translateY(40px)",
                  filter: isCardVisible
                    ? "blur(0px)"
                    : "blur(8px)",
                  transitionProperty: "transform, opacity, filter",
                  transitionDuration: "800ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Outer White Card Frame */}
                <div
                  className={[
                    "relative w-full rounded-[1.75rem] p-3 pt-7 sm:p-3.5 sm:pt-8 bg-white dark:bg-bg-card border border-text-main/10 shadow-[0_16px_36px_rgba(10,25,47,0.08)] hover:shadow-[0_22px_50px_rgba(37,99,235,0.16)] hover:border-hero-ice-blue/40 transition-all duration-300 z-10",
                    scheme.rotation,
                  ].join(" ")}
                >
                  {/* Canonical Thumbtack Pin Graphic */}
                  <PushPinSVG
                    colorClass={scheme.pin}
                    isPinned={isCardVisible}
                    pinRef={(el) => {
                      pinRefs.current[idx] = el;
                    }}
                  />

                  {/* Inner Tinted Content Box */}
                  <div
                    className={[
                      "w-full rounded-[1.25rem] p-4 sm:p-5 border space-y-2.5",
                      scheme.innerBg,
                    ].join(" ")}
                  >
                    {/* Step Number Badge */}
                    <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight block ${scheme.numText}`}>
                      {pillar.number || `0${idx + 1}`}
                    </span>

                    {/* Step Title */}
                    <h3 className="text-base sm:text-lg font-bold text-text-main leading-snug font-serif">
                      {pillar.title}
                    </h3>

                    {/* Step Description */}
                    <p className="text-xs sm:text-xs text-text-main/75 font-sans leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

