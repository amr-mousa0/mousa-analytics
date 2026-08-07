import { useCallback, useEffect, useRef, useState } from "react";
import type { BaseCarouselProps } from "../base/carousel.types";
import { CAROUSEL_BEHAVIOR } from "../base/carousel.behavior";
import { getItemPosition } from "./circular-carousel.config";

export interface CircularCarouselProps extends BaseCarouselProps {
  ariaLabel?: string;
  prevLabel?: string;
  nextLabel?: string;
}

function renderToolLogo(iconName?: string, tag?: string, title?: string) {
  const key = `${iconName || ''} ${tag || ''} ${title || ''}`.toLowerCase();

  if (key.includes("power") || key.includes("bi") || key.includes("لوحات") || key.includes("dashboard")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#F2C811]/15 text-[#D9A406] dark:text-[#F2C811] flex items-center justify-center shrink-0 border border-[#F2C811]/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg" aria-label="Power BI logo">
          <title>Power BI</title>
          <rect x="3" y="12" width="4" height="8" rx="0.5" />
          <rect x="10" y="7" width="4" height="13" rx="0.5" />
          <rect x="17" y="2" width="4" height="18" rx="0.5" />
        </svg>
      </div>
    );
  }

  if (key.includes("excel") || key.includes("إكسل") || key.includes("sheet") || key.includes("نماذج")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#10793F]/15 text-[#10793F] dark:text-[#22C55E] flex items-center justify-center shrink-0 border border-[#10793F]/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Excel logo">
          <title>Excel</title>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
        </svg>
      </div>
    );
  }

  if (key.includes("sql") || key.includes("بيانات") || key.includes("تنظيم") || key.includes("data") || key.includes("db")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-blue-600/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-600/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="SQL logo">
          <title>SQL Database</title>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      </div>
    );
  }

  if (key.includes("python") || key.includes("أتمتة") || key.includes("auto")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#3776AB]/15 text-[#3776AB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 border border-[#3776AB]/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Python logo">
          <title>Python Automation</title>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </div>
    );
  }

  if (key.includes("stat") || key.includes("إحصاء") || key.includes("r &")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-purple-600/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-600/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Statistical Analysis logo">
          <title>Statistical Analysis</title>
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      </div>
    );
  }

  if (key.includes("meta") || key.includes("إعلانات") || key.includes("تسويق") || key.includes("ads") || key.includes("market") || key.includes("ga4")) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#0668E1]/15 text-[#0668E1] dark:text-[#3B82F6] flex items-center justify-center shrink-0 border border-[#0668E1]/30 shadow-sm">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-label="Marketing Analytics logo">
          <title>Marketing Analytics</title>
          <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-9 h-9 rounded-xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-600/30 shadow-sm">
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    </div>
  );
}

export function CircularCarousel({
  items,
  activeIndex: controlledIndex,
  onActiveChange,
  autoPlay = CAROUSEL_BEHAVIOR.DEFAULT_AUTO_PLAY,
  autoPlayInterval = CAROUSEL_BEHAVIOR.DEFAULT_AUTO_PLAY_INTERVAL,
  className = "",
  ariaLabel = "Circular carousel",
  prevLabel = "Previous item",
  nextLabel = "Next item",
}: CircularCarouselProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasEntered(true);
      setIsEntranceDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasEntered) return;
    const timer = setTimeout(() => setIsEntranceDone(true), 1600);
    return () => clearTimeout(timer);
  }, [hasEntered]);

  const total = items.length;
  const activeIndex = controlledIndex ?? internalIndex;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const newIndex = ((index % total) + total) % total;
      if (controlledIndex === undefined) {
        setInternalIndex(newIndex);
      }
      onActiveChange?.(newIndex);
    },
    [total, controlledIndex, onActiveChange]
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (!autoPlay || isHovered || isFocused || total <= 1) return;
    intervalRef.current = setInterval(next, autoPlayInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, autoPlayInterval, isHovered, isFocused, next, total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    const el = containerRef.current;
    el?.addEventListener("keydown", handler);
    return () => el?.removeEventListener("keydown", handler);
  }, [next, prev]);

  if (total === 0) return null;



  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={[
        "relative flex flex-col items-center justify-center gap-8 outline-none select-none py-6 w-full max-w-4xl mx-auto",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Circular Orbit Stage */}
      <div className="relative h-[300px] sm:h-[320px] w-full flex items-center justify-center overflow-visible">
        {items.map((item, i) => {
          const pos = getItemPosition(i, activeIndex, total);
          if (!pos) return null;

          const isActive = i === activeIndex;

          const entering = !hasEntered;
          const staggerDelay = Math.abs(pos.adjustedOffset) * 20;

          const cssVars = {
            "--card-x": `${entering ? pos.x * 3.2 : pos.x}px`,
            "--card-y": `${entering ? pos.y * 3.2 : pos.y}px`,
            "--card-scale": entering ? pos.scale * 0.2 : pos.scale,
            "--card-opacity": entering ? 0 : pos.opacity,
            "--card-z": pos.zIndex,
            "--card-rot": "0deg",
            "--card-duration": isEntranceDone ? "220ms" : "1250ms",
            "--card-ease": "var(--motion-easing-standard)",
            transitionDelay: entering ? "0ms" : `${staggerDelay}ms`,
            zIndex: pos.zIndex,
          } as Record<string, string | number>;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={item.title}
              aria-selected={isActive}
              role="option"
              style={cssVars}
              className={[
                "motion-transform-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer h-44 sm:h-48 w-60 sm:w-[17.5rem]",
                "p-[3px] rounded-[1.5rem] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col group",
                isActive
                  ? "bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.04] shadow-[0_32px_64px_rgba(0,0,0,0.08)] scale-[1.03]"
                  : "bg-transparent border border-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02] scale-100",
              ].join(" ")}
            >
              <div
                className={[
                  "relative w-full h-full flex flex-col items-start justify-between rounded-[calc(1.5rem-3px)] p-4 sm:p-5 text-start font-sans transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden",
                  isActive
                    ? "bg-bg-card border border-accent-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ring-1 ring-accent-primary/10"
                    : "bg-bg-card/90 border border-border-subtle shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] dark:shadow-none hover:border-border-strong",
                ].join(" ")}
              >
              {/* Top Row: Tool Logo + Category Tag */}
              <div className="w-full flex items-center justify-between gap-2">
                {renderToolLogo(item.icon, item.tag, item.title)}
                {item.tag && (
                  <span className="rounded-full bg-accent-primary/10 border border-accent-primary/20 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-accent-primary truncate max-w-[120px]">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="w-full mt-auto relative z-10">
                <h3
                  className={[
                    "font-bold font-serif tracking-tight leading-tight transition-colors duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive
                      ? "text-text-main text-[17px] sm:text-[19px]"
                      : "text-text-main/80 text-sm sm:text-[15px]",
                  ].join(" ")}
                >
                  {item.title}
                </h3>
                <p
                  className={[
                    "mt-1.5 text-xs sm:text-[13px] leading-relaxed transition-colors duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] font-sans line-clamp-2 sm:line-clamp-3",
                    isActive ? "text-text-main/80" : "text-text-main/70",
                  ].join(" ")}
                >
                  {item.description}
                </p>
              </div>
              </div>
            </button>
          );
        })}

        {/* Stage Center Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-20 sm:translate-y-24 pointer-events-none z-0">
          <span className="text-3xl sm:text-5xl font-bold font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-accent-primary/50 drop-shadow-sm">
            {String(activeIndex + 1).padStart(2, "0")}
          </span>
          <span className="mt-1 text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.25em] text-text-main/40 uppercase">
            of {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Interactive Controls & Navigation */}
      <div className="flex items-center gap-6 z-20 mt-4" dir="ltr">
        <button
          type="button"
          onClick={prev}
          aria-label={prevLabel}
          className="group relative flex items-center justify-center p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-card shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-border-subtle group-hover:border-accent-primary/30 transition-colors duration-[600ms]">
            <svg
              className="w-4 h-4 text-text-main/70 group-hover:text-accent-primary transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>

        {/* Tab Dots */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]" role="tablist">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => goTo(i)}
              className={[
                "h-1.5 rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                i === activeIndex
                  ? "w-6 bg-accent-primary shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                  : "w-1.5 bg-text-main/15 hover:bg-text-main/30",
              ].join(" ")}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={next}
          aria-label={nextLabel}
          className="group relative flex items-center justify-center p-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-card shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-border-subtle group-hover:border-accent-primary/30 transition-colors duration-[600ms]">
            <svg
              className="w-4 h-4 text-text-main/70 group-hover:text-accent-primary transition-colors"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}

export default CircularCarousel;
