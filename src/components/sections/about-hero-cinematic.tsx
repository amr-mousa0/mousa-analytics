"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "../../i18n";
import { BRAND_CONSTANTS } from "../../lib/constants/brand.constants";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AboutHeroCinematicProps {
  lang?: "en" | "ar";
}

export default function AboutHeroCinematic({ lang = "en" }: AboutHeroCinematicProps) {
  const t = useTranslations(lang);
  const isAr = lang === "ar";

  const sectionRef = useRef<HTMLElement>(null);
  const mousaDataRef = useRef<HTMLDivElement>(null);
  const analyticsRef = useRef<HTMLDivElement>(null);
  const laptopOuterRef = useRef<HTMLDivElement>(null);
  const laptopInnerRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);

  const [imageLoaded] = useState(true);

  useEffect(() => {
    // Refresh ScrollTrigger once DOM mounts
    ScrollTrigger.refresh();
  }, []);

  useEffect(() => {
    if (!imageLoaded) return;

    gsap.set(laptopInnerRef.current, { transformPerspective: 1000 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          start: "top top",
          end: "+=150%",
        }
      });

      const ease = "power2.out";

      // Phase 1: Hold 100% opacity at top (scroll 0 -> 20)
      tl.to([mousaDataRef.current, analyticsRef.current, laptopInnerRef.current], {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        y: 0,
        duration: 20,
        ease: "none"
      }, 0);

      // Phase 2: Fade & scale out as user scrolls down (20 -> 100)
      tl.to(mousaDataRef.current, {
        y: "-10vh",
        scale: 1.04,
        opacity: 0.15,
        filter: "blur(8px)",
        duration: 80,
        ease: ease
      }, 20);

      tl.to(analyticsRef.current, {
        y: "-6vh",
        scale: 1.08,
        opacity: 0.15,
        filter: "blur(6px)",
        duration: 80,
        ease: ease
      }, 20);

      tl.to(laptopInnerRef.current, {
        scale: 1.28,
        y: 12,
        rotateX: 4,
        opacity: 0.15,
        filter: "blur(4px)",
        duration: 80,
        ease: ease
      }, 20);

      tl.to(shadowRef.current, {
        opacity: 0.14,
        scale: 1.35,
        duration: 80,
        ease: ease
      }, 20);

    }, sectionRef);

    return () => ctx.revert();
  }, [imageLoaded]);

  const socials = [
    { name: "LinkedIn", url: BRAND_CONSTANTS.SOCIAL_LINKEDIN, icon: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2" /> },
    { name: "GitHub", url: BRAND_CONSTANTS.SOCIAL_GITHUB, icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /> },
    { name: "WhatsApp", url: BRAND_CONSTANTS.WHATSAPP_URL, icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /> },
  ];

  const handleOpenContact = () => {
    window.dispatchEvent(new CustomEvent("open-contact-modal"));
  };

  const arPart1 = "موسى لتحليل";
  const arPart2 = "البيانات";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[100dvh] flex flex-col justify-between bg-[#080807] text-[#F2F2EF] font-sans select-none"
    >
      {/* Bottom edge handoff — seamless dark bleed into gallery strip */}
      <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-b from-transparent to-[#0e0e0d] pointer-events-none z-10" />

      <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center">

        {/* Shadow Layer */}
        <div
          ref={shadowRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(520px,72vw,980px)] aspect-[16/9] pointer-events-none z-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)" }}
        />

        {/* Laptop Area */}
        <div
          ref={laptopOuterRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(520px,72vw,980px)] aspect-[16/9] z-10 flex items-center justify-center pointer-events-none"
        >
          <div
            ref={laptopInnerRef}
            className="w-full h-full will-change-transform"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 72%)",
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0) 72%)"
            }}
          >
            <img
              src="/dashboard-hero.webp"
              alt={t.nav.brandTitle as string}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Title Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full flex flex-col items-center justify-center pointer-events-none px-4">

          {isAr ? (
            <div
              className="flex flex-col items-center text-center w-full max-w-[1400px] leading-none"
              dir="rtl"
              style={{ fontFamily: "'IBM Plex Sans Arabic', 'Alexandria', 'Cairo', sans-serif" }}
            >
              <div ref={mousaDataRef} className="w-full will-change-transform">
                <h1
                  className="text-white font-bold leading-[0.98] tracking-normal text-[clamp(60px,13.5vw,205px)] w-full text-center m-0"
                  style={{
                    textShadow: "0 4px 60px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.9)"
                  }}
                >
                  {arPart1}
                </h1>
              </div>
              <div ref={analyticsRef} className="w-full mt-[1%] will-change-transform">
                <h1
                  className="text-white font-bold leading-[0.98] tracking-normal text-[clamp(68px,15.5vw,230px)] w-full text-center m-0"
                  style={{
                    textShadow: "0 4px 60px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.9)"
                  }}
                >
                  {arPart2}
                </h1>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center w-full max-w-[1200px] leading-none">
              <div ref={mousaDataRef} className="w-full will-change-transform">
                <h1
                  className="text-white font-[800] uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(48px,11.5vw,175px)] w-full text-center m-0"
                  style={{ textShadow: "0 4px 60px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.9)" }}
                >
                  MOUSA DATA
                </h1>
              </div>
              <div ref={analyticsRef} className="w-full relative mt-[-2%] will-change-transform">
                <h1
                  className="text-white font-[800] uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(48px,11.5vw,175px)] w-full text-center m-0"
                  style={{ textShadow: "0 4px 60px rgba(0,0,0,0.95), 0 0 120px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.9)" }}
                >
                  ANALYTICS
                </h1>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <footer className="w-full absolute bottom-0 left-0 z-30 pb-[26px] px-[39px] sm:px-[42px] flex items-end justify-between pointer-events-auto">

        {/* Bottom-Left Social Buttons */}
        <div className="flex items-center gap-[6px]">
          {socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="w-[30px] h-[30px] rounded-full border border-white/[0.07] bg-white/[0.015] flex items-center justify-center text-[#848480] hover:text-[#F2F2EF] hover:border-white/20 transition-all cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {social.icon}
              </svg>
            </a>
          ))}
        </div>

        {/* Bottom-Right CTA Button */}
        <div>
          <button
            type="button"
            onClick={handleOpenContact}
            className="h-[30px] px-[16px] rounded-full border border-white/[0.08] bg-white/[0.015] flex items-center gap-2 text-[#F2F2EF] hover:border-white/20 transition-all font-sans cursor-pointer"
          >
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              {t.aboutPage.startProject}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </section>
  );
}

