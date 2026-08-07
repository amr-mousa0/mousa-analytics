import { useState, useCallback, useEffect, useRef } from "react";
import { FAN_POSITIONS } from "./fan-carousel.config";

interface CardItem {
  imgUrl?: string;
  alt?: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  highlights?: string[];
  skills?: string[];
  date?: string;
  company?: string;
  badge?: string;
}

interface SocialCardsProps {
  cards: CardItem[];
}

// Arrow button classes — adhering strictly to design system theme tokens & tactile physics
const ARROW_BTN =
  "flex items-center justify-center w-12 h-12 rounded-full border border-border-subtle bg-bg-card text-text-main shadow-ambient cursor-pointer select-none shrink-0 z-40 outline-none hover:border-border-accent hover:text-text-accent hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent-primary transition-all duration-300";

// Ambient background pattern with multi-layered depth & subtle blue accent touch
function AmbientBg({ index }: { index: number }) {
  const isAlt = index % 2 === 1;
  return (
    <div className="absolute inset-0 overflow-hidden bg-white dark:bg-bg-card pointer-events-none z-0 rounded-[2rem]">
      {/* Soft Brand Blue Primary Radial Ambient Touches */}
      <div className={`absolute ${isAlt ? '-bottom-12 -right-12' : '-top-12 -right-12'} w-72 h-72 rounded-full bg-accent-primary/[0.08] blur-3xl`} />
      <div className={`absolute ${isAlt ? '-top-12 -left-12' : '-bottom-12 -left-12'} w-72 h-72 rounded-full bg-accent-primary/[0.05] blur-3xl`} />
      
      {/* Subtle Soft Blue Surface Gradient Wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-white to-transparent dark:from-accent-primary/[0.04] dark:via-bg-card dark:to-bg-card" />
    </div>
  );
}

// Compute CSS custom properties for a card's position
function computeCardVars(
  index: number,
  centerIndex: number,
  totalCards: number,
  activeCardIndex: number | null,
  hasEntered: boolean,
  isEntranceDone: boolean,
  targetNtiIndex: number
): Record<string, string | number> {
  const entering = !hasEntered;

  let x: number;
  let y: number;
  let rot: number;
  let scale: number;
  let zIndex: number;
  let opacity: number;

  if (entering) {
    // Stage 1: Fast Entrance from Bottom
    const base = FAN_POSITIONS[3];
    x = base.x;
    y = base.y + 40;
    rot = base.rot;
    scale = 0.8;
    zIndex = index + 1;
    opacity = 0;
  } else {
    // Stage 2: Fan Layout Position centered on current centerIndex
    let offset = index - centerIndex;
    if (offset > Math.floor(totalCards / 2)) offset -= totalCards;
    if (offset < -Math.floor(totalCards / 2)) offset += totalCards;

    let posIndex = offset + 3;
    posIndex = Math.max(0, Math.min(FAN_POSITIONS.length - 1, posIndex));

    const base = FAN_POSITIONS[posIndex] || FAN_POSITIONS[3];
    x = base.x;
    y = base.y;
    rot = base.rot;
    scale = base.scale;
    zIndex = base.zIndex;
    opacity = 1;

    if (activeCardIndex !== null) {
      if (activeCardIndex === index) {
        y -= 3.5;
        rot = 0;
        scale *= 1.05;
        zIndex = 40;
      } else {
        let hoverOffset = activeCardIndex - centerIndex;
        if (hoverOffset > Math.floor(totalCards / 2)) hoverOffset -= totalCards;
        if (hoverOffset < -Math.floor(totalCards / 2)) hoverOffset += totalCards;
        if (offset < hoverOffset) { x -= 5.5; rot -= 6; }
        else if (offset > hoverOffset) { x += 5.5; rot += 6; }
      }
    }
  }

  // Stagger Delay: Sequential pull-in like dealing a deck
  const staggerDelay = entering ? 0 : (!isEntranceDone ? index * 80 : 0);
  
  // Duration: 1200ms for fast entrance fly-in, 400ms for normal interaction
  let duration = "400ms";
  if (!isEntranceDone) {
    duration = "1200ms";
  }

  return {
    "--card-x": `${x}rem`,
    "--card-y": `${y}rem`,
    "--card-rot": `${rot}deg`,
    "--card-scale": scale,
    "--card-z": zIndex,
    "--card-opacity": opacity,
    "--card-duration": duration,
    "--card-ease": "cubic-bezier(0.215, 0.61, 0.355, 1)", // power3.out
    transitionDelay: `${staggerDelay}ms`,
    zIndex,
  };
}

const SocialCards = ({ cards }: SocialCardsProps) => {
  const totalCards = cards?.length ?? 0;
  
  // Find NTI Data Analyst card index to land on
  const ntiIndex = cards?.findIndex(
    (c) =>
      (c.company && c.company.toUpperCase().includes("NTI")) ||
      (c.title && (c.title.includes("NTI") || c.title.includes("القومي")))
  );
  const targetNtiIndex = ntiIndex !== -1 ? ntiIndex : 0;

  const [centerIndex, setCenterIndex] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll Trigger Observer: Motion starts ONLY when user scrolls to section
  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      setHasEntered(true);
      setCenterIndex(targetNtiIndex);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasEntered(true);
      setIsEntranceDone(true);
      setCenterIndex(targetNtiIndex);
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
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [targetNtiIndex]);

  // Choreography:
  // 1. Fast, clean entrance deal (1200ms)
  // 2. Lock & Land directly on target card
  useEffect(() => {
    if (!hasEntered) return;

    const flyInTimer = setTimeout(() => {
      setIsEntranceDone(true);
      setCenterIndex(targetNtiIndex);
    }, 1200);

    return () => clearTimeout(flyInTimer);
  }, [hasEntered, targetNtiIndex]);

  const cycle = useCallback(
    (dir: "left" | "right") => {
      if (totalCards <= 1) return;
      setCenterIndex((prev) =>
        dir === "right"
          ? (prev + 1) % totalCards
          : (prev - 1 + totalCards) % totalCards
      );
    },
    [totalCards]
  );

  if (!totalCards) return null;

  const chevron = (dir: "left" | "right") => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d={dir === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );

  // Executive card dimensions & stage height
  const cardW = "w-[19.5rem] sm:w-[23.5rem] md:w-[26.5rem]";
  const cardH = "h-[27rem] sm:h-[30rem] md:h-[32.5rem]";
  const cardLeft = "left-[calc(50%-9.75rem)] sm:left-[calc(50%-11.75rem)] md:left-[calc(50%-13.25rem)]";
  const cardTop  = "top-[calc(50%-13.5rem)] sm:top-[calc(50%-15rem)] md:top-[calc(50%-16.25rem)]";

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center w-full py-6 overflow-visible select-none"
    >
      {/* ─── Stage Ambient Backdrop Lighting (Executive Depth Aura) ─────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[34rem] sm:w-[48rem] h-[22rem] sm:h-[28rem] rounded-full bg-accent-primary/10 blur-[100px] transform -translate-y-4" />
        <div className="absolute w-[24rem] sm:w-[36rem] h-[14rem] sm:h-[18rem] rounded-full bg-blue-500/8 blur-[70px]" />
      </div>

      {/* ─── Fan Stage ─────────────────────────────────────────────── */}
      <div className="relative flex justify-center items-center w-full max-w-[80rem] h-[30.5rem] sm:h-[33.5rem] md:h-[36rem] z-10">
        {cards.map((card, index) => {
          const cssVars = computeCardVars(
            index,
            centerIndex,
            totalCards,
            activeCardIndex,
            hasEntered,
            isEntranceDone,
            targetNtiIndex
          );
          const isActive = activeCardIndex === index;
          const isCenter = centerIndex === index;

          const inner = (
            <div className="relative w-full h-full p-1 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group hover:-translate-y-1">
              <div
                className={[
                  "relative w-full h-full rounded-[1.75rem] overflow-hidden bg-white dark:bg-[#050505] flex flex-col justify-between p-5 sm:p-6 text-text-main font-sans",
                  "transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isActive || isCenter
                    ? "border border-accent-primary/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(37,99,235,0.12)] ring-1 ring-accent-primary/10"
                    : "border border-black/5 dark:border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] group-hover:border-black/10 dark:group-hover:border-white/15",
                ].join(" ")}
              >
                {/* Subtle noise texture for physical feel */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
                
                <AmbientBg index={index} />

              {/* Physical Top Edge Light Refraction */}
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent-primary/25 to-transparent z-10 pointer-events-none rounded-t-[2rem]" />

              {/* Top Header Row */}
              <div className="relative z-10 flex items-center justify-between gap-2.5 pb-3 border-b border-border-subtle">
                {card.company && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-accent-primary/10 border border-accent-primary/25 text-accent-primary leading-none truncate max-w-[70%] shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse shrink-0" />
                    <span>{card.company}</span>
                  </span>
                )}
                {card.date && (
                  <span className="shrink-0 text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider text-text-main/75 px-2.5 py-1 rounded-lg bg-bg-secondary/90 border border-border-subtle backdrop-blur-sm shadow-sm">
                    {card.date}
                  </span>
                )}
              </div>

              {/* Main Executive Copy & Bullet Points */}
              <div className="relative z-10 space-y-3 my-auto py-1">
                {card.title && (
                  <h3 className="text-base sm:text-lg md:text-xl font-bold font-serif text-text-main leading-snug tracking-tight max-w-[98%]">
                    {card.title}
                  </h3>
                )}

                {card.description && !card.highlights && (
                  <p className="text-xs sm:text-sm text-text-main/70 font-sans leading-relaxed font-normal">
                    {card.description}
                  </p>
                )}

                {/* Render Structured Bullet Points List */}
                {card.highlights && card.highlights.length > 0 && (
                  <ul className="space-y-2 pt-0.5">
                    {card.highlights.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-[13px] text-text-main/85 leading-relaxed font-normal group/item">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0 mt-1.5 shadow-[0_0_8px_rgba(37,99,235,0.6)] group-hover/item:scale-125 transition-transform duration-200" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer Tech Stack / Skills Row */}
              {card.skills && card.skills.length > 0 && (
                <div className="relative z-10 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-border-subtle">
                  {card.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono font-medium bg-bg-secondary/90 text-text-main/80 border border-border-subtle shadow-sm hover:border-accent-primary/50 hover:text-text-main transition-all duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            </div>
          );

          return (
            <div
              key={index}
              className={`motion-transform-card absolute ${cardW} ${cardH} ${cardLeft} ${cardTop} cursor-pointer`}
              style={cssVars as React.CSSProperties}
              onMouseEnter={() => setActiveCardIndex(index)}
              onMouseLeave={() => setActiveCardIndex(null)}
            >
              {card.linkUrl ? (
                <a
                  href={card.linkUrl}
                  target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {inner}
                </a>
              ) : inner}
            </div>
          );
        })}
      </div>

      {/* ─── Executive Controls ─────────────────────────────────────────────── */}
      {totalCards > 1 && (
        <div className="flex items-center gap-6 mt-8 z-40" dir="ltr">
          <button
            className={ARROW_BTN}
            onClick={() => cycle("left")}
            aria-label="Previous"
          >
            {chevron("left")}
          </button>

          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-bg-card/90 border border-border-subtle shadow-[0_8px_30px_rgba(10,25,47,0.08)] backdrop-blur-xl">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCenterIndex(i)}
                aria-label={`Go to card ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all duration-300",
                  i === centerIndex
                    ? "w-8 bg-accent-primary shadow-[0_0_14px_rgba(37,99,235,0.6)]"
                    : "w-2.5 bg-text-main/20 hover:bg-text-main/45",
                ].join(" ")}
              />
            ))}
          </div>

          <button
            className={ARROW_BTN}
            onClick={() => cycle("right")}
            aria-label="Next"
          >
            {chevron("right")}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialCards;
