"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Image Registry ──────────────────────────────────────────────────────────
const ROW_ONE_IMAGES = [
  { src: "/images/uploads/marketing-roi.webp", alt: "Marketing Campaign ROI Analytics", label: "Marketing ROI" },
  { src: "/images/uploads/oxygen-gym.webp", alt: "Oxygen Gym Financial Transformation", label: "Financial Analytics" },
  { src: "/images/uploads/coffee-shop.webp", alt: "Coffee Shop Sales Analysis", label: "Sales Optimization" },
  { src: "/images/uploads/marketing/1756149438611.jpg", alt: "Meta Ads & Funnel Performance", label: "Paid Acquisition" },
  { src: "/images/uploads/gym/1759149287257.jpg", alt: "Member Churn & Revenue Leakage", label: "Churn Analysis" },
];

const ROW_TWO_IMAGES = [
  { src: "/images/uploads/cafe-bar/project.JPG", alt: "Coffee Shop Peak Transaction Analysis", label: "Peak Analytics" },
  { src: "/images/uploads/marketing/1756149438724.jpg", alt: "Channel ROAS & Conversion Trends", label: "ROAS Matrix" },
  { src: "/images/uploads/gym/1759149287549.jpg", alt: "Unbilled Membership Leakage Audit", label: "Leakage Audit" },
  { src: "/images/uploads/cafe-bar/project-2.JPG", alt: "Star Schema Relational Sales Model", label: "Star Schema" },
  { src: "/images/uploads/marketing/1756149438816.jpg", alt: "Seasonal CPA & Ad Spend Allocation", label: "Ad Spend Allocation" },
];

// ─── Single Image Tile ───────────────────────────────────────────────────────
interface TileProps {
  src: string;
  alt: string;
  label: string;
}

function GalleryTile({ src, alt, label }: TileProps) {
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: "clamp(220px, 22vw, 380px)",
        aspectRatio: "4 / 3",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 10px 36px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: "saturate(0.85) brightness(0.9)",
          transition:
            "filter 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.filter = "saturate(1.1) brightness(1.02)";
          el.style.transform = "scale3d(1.05, 1.05, 1)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.filter = "saturate(0.85) brightness(0.9)";
          el.style.transform = "scale3d(1, 1, 1)";
        }}
      />
      {/* Bottom gradient for legible label */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(4,4,4,0.75) 0%, rgba(4,4,4,0.15) 35%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          bottom: "12px",
          left: "14px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(242,242,239,0.7)",
          fontFamily: "var(--font-sans)",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Horizontal Row ──────────────────────────────────────────────────────────
function GalleryRow({
  images,
  rowRef,
  ariaLabel,
}: {
  images: TileProps[];
  rowRef: React.RefObject<HTMLDivElement | null>;
  ariaLabel: string;
}) {
  const tiles = [...images, ...images];
  return (
    <div
      ref={rowRef}
      role="list"
      aria-label={ariaLabel}
      style={{
        display: "flex",
        gap: "clamp(12px, 1.4vw, 20px)",
        willChange: "transform",
      }}
    >
      {tiles.map((img, i) => (
        <div key={`${img.src}-${i}`} role="listitem">
          <GalleryTile {...img} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GalleryStripParallax() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const row1 = row1Ref.current;
    const row2 = row2Ref.current;
    if (!section || !row1 || !row2) return;

    const ctx = gsap.context(() => {
      // Row 1: Moves smoothly to the RIGHT (from -18% to 6%)
      gsap.fromTo(
        row1,
        { xPercent: -18 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );

      // Row 2: Moves smoothly to the LEFT (from 6% to -18%)
      gsap.fromTo(
        row2,
        { xPercent: 6 },
        {
          xPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );
    }, section);

    // ── Robust Refresh Logic for Hard Reloads ──
    // The Hero section above this one pins itself AFTER its image decodes.
    // We must ensure this gallery recalculates its scroll positions after the hero injects its pin spacer.
    const handleRefresh = () => {
      ScrollTrigger.sort(); // Ensure triggers are ordered by DOM position
      ScrollTrigger.refresh();
    };

    if (document.readyState === "complete") {
      // If already loaded, give a small tick for React to settle then refresh
      setTimeout(handleRefresh, 100);
    } else {
      // On hard refresh, wait for all assets to load
      window.addEventListener("load", handleRefresh);
    }

    // Fallback: If the layout shifts (e.g. Hero pin spacer injected dynamically), refresh
    const observer = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    observer.observe(document.body);

    return () => {
      window.removeEventListener("load", handleRefresh);
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Portfolio Work Gallery"
      style={{
        width: "100%",
        background: "#0e0e0d",
        overflow: "hidden",
        position: "relative",
        paddingTop: "clamp(48px, 6vw, 90px)",
        paddingBottom: "clamp(90px, 12vw, 170px)",
      }}
    >
      {/* ── Soft Edge Vignette Filters ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 35%, rgba(14,14,13,0.6) 65%, #0e0e0d 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to right, #0e0e0d 0%, rgba(14,14,13,0.85) 6%, transparent 20%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to left, #0e0e0d 0%, rgba(14,14,13,0.85) 6%, transparent 20%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* ── Gallery Rows Container ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(12px, 1.5vw, 22px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <GalleryRow
          images={ROW_ONE_IMAGES}
          rowRef={row1Ref}
          ariaLabel="Portfolio projects — row one"
        />
        <GalleryRow
          images={ROW_TWO_IMAGES}
          rowRef={row2Ref}
          ariaLabel="Portfolio projects — row two"
        />
      </div>


    </section>
  );
}
