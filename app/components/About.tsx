"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { useReveal } from "@/app/hooks/useReveal";

const PHOTOS = [
  {
    src: "/about/IMG_0143.jpg",
    caption: "Worked alongside Howard Lerman, Founder of Yext and Roam, for over a decade.",
  },
  {
    src: "/about/IMG_1682.jpg",
    caption: "Won a top performer award at Yext in 2016.",
  },
  {
    src: "/about/IT_Ops_team.jpg",
    caption: "Managed a 16-person global IT Operations team at Yext.",
  },
  {
    src: "/london-show.png",
    caption: "Managed backstage AV for live events at both Roam and Yext.",
  },
  { src: "/about/mobile_platforms.jpeg", caption: "Hosted the Makes Remote Work podcast, interviewing CEOs and Founders in short, practical segments." },
  {
    src: "/about/IMG_2632.jpg",
    caption: "Ran an event planning company with my best friend for nearly a decade as a side hustle.",
  },
];

export default function About() {
  const ref = useReveal();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [captionVisible, setCaptionVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = PHOTOS.length;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxPhotoVisible, setLightboxPhotoVisible] = useState(false);

  const goTo = useCallback((index: number) => {
    if (total <= 1) return;
    setVisible(false);
    setCaptionVisible(false);
    setTimeout(() => {
      setCurrent((index + total) % total);
      setVisible(true);
      setTimeout(() => setCaptionVisible(true), 200);
    }, 700);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Reset and start timer — pause when lightbox is open
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!hovering && !lightboxOpen && total > 1) {
      timerRef.current = setTimeout(next, 4000);
    }
  }, [hovering, lightboxOpen, next, total]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, hovering, lightboxOpen, resetTimer]);

  function handleArrow(fn: () => void) {
    if (timerRef.current) clearTimeout(timerRef.current);
    fn();
  }

  // Lightbox open/close
  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLightboxVisible(true);
        setTimeout(() => setLightboxPhotoVisible(true), 50);
      });
    });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
    setLightboxPhotoVisible(false);
    setTimeout(() => setLightboxOpen(false), 250);
  }, []);

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % total);
  }, [total]);

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lightboxNext();
      if (e.key === "ArrowLeft") lightboxPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, lightboxNext, lightboxPrev]);

  return (
    <>
      <m.section
        id="about"
        ref={ref as React.RefObject<HTMLElement>}
        className="py-32 px-8 overflow-hidden"
        style={{ background: "var(--bg-1)" }}
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 32 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[45%_55%] gap-12 items-start" style={{ columnGap: 48 }}>

          {/* Left — photo carousel */}
          <div className="reveal-scale">
            <div style={{ width: "100%" }}>
              {/* Photo frame */}
              <div
                className="relative overflow-hidden"
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: "12px 12px 0 0",
                  cursor: "zoom-in",
                  flexShrink: 0,
                }}
                onMouseEnter={() => { setHovering(true); setShowArrows(true); }}
                onMouseLeave={() => { setHovering(false); setShowArrows(false); }}
                onClick={() => openLightbox(current)}
              >
                {PHOTOS.map((photo, i) => (
                  <div
                    key={photo.src}
                    className="absolute inset-0"
                    style={{
                      opacity: i === current ? (visible ? 1 : 0) : 0,
                      transition: "opacity 0.7s ease",
                      filter: "grayscale(20%)",
                    }}
                  >
                    <Image
                      src={photo.src}
                      alt={photo.caption}
                      fill
                      className="object-cover"
                      style={{ objectPosition: "center top" }}
                      priority={i === 0}
                    />
                  </div>
                ))}

                {/* Arrow buttons */}
                {total > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArrow(prev); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-200"
                      style={{
                        width: 34, height: 34,
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(201,168,76,0.4)",
                        borderRadius: "50%",
                        color: "#c9a84c",
                        fontSize: 18,
                        opacity: showArrows ? 1 : 0,
                        lineHeight: 1,
                        cursor: "default",
                      }}
                      aria-label="Previous photo"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleArrow(next); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-all duration-200"
                      style={{
                        width: 34, height: 34,
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(201,168,76,0.4)",
                        borderRadius: "50%",
                        color: "#c9a84c",
                        fontSize: 18,
                        opacity: showArrows ? 1 : 0,
                        lineHeight: 1,
                        cursor: "default",
                      }}
                      aria-label="Next photo"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Caption bar */}
              <div
                style={{
                  background: "#111",
                  padding: "12px 16px",
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#aaa",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    margin: 0,
                    opacity: captionVisible ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  {PHOTOS[current].caption}
                </p>
              </div>

              {/* Dot indicators */}
              {total > 1 && (
                <div className="flex gap-2 justify-center mt-4">
                  {PHOTOS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); goTo(i); }}
                      style={{
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: i === current ? "#c9a84c" : "#333",
                        border: "none",
                        padding: 0,
                        transition: "background 0.3s ease",
                        cursor: "pointer",
                      }}
                      aria-label={`Go to photo ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — text with amber left border */}
          <m.div
            className="pl-8"
            style={{ borderLeft: "2px solid rgba(201,168,76,0.6)" }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <m.p
              className="reveal text-xs font-bold tracking-widest uppercase mb-6"
              style={{ color: "var(--blue-2)" }}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            >
              The story
            </m.p>
            <m.h2
              className="reveal d1 mb-10"
              style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            >
              Do Cool Things. Get Shit Done.
            </m.h2>
            <m.div
              className="reveal d2 space-y-5 text-base leading-relaxed"
              style={{ color: "var(--body)" }}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            >
              <p>
                I&apos;ve spent 15+ years inside companies that were moving fast and figuring it out as they went. At Yext, I joined pre-IPO and helped implement critical IT initiatives needed before the company went public on the NYSE in 2017, growing from IT Support Engineer to Head of IT Operations over 7+ years. At Roam, I was one of two people responsible for the entire customer side of the business: onboarding, support, implementation, GTM. We scaled from pre-revenue to $3M+ ARR. If it touched a customer, it ran through us.
              </p>
              <p>
                What I&apos;ve learned is that the best operators don&apos;t wait for clean org charts or perfect playbooks. They figure out what needs to happen, build the system, and get it done. That&apos;s how I&apos;ve always worked.
              </p>
              <p>
                I bring that same mindset to everything, including how I work. I use AI as a force multiplier, moving faster, thinking bigger, and solving problems that used to take a team.
              </p>
              <p>
                At the end of the day, none of it matters without the people. The relationships I&apos;ve built across customers, teammates, and leaders are what I&apos;m most proud of. That&apos;s where I shine.
              </p>
            </m.div>

            <m.p
              className="reveal d3 mt-10 text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--muted)" }}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
            >
              New York&nbsp;&nbsp;·&nbsp;&nbsp;Roam&nbsp;&nbsp;·&nbsp;&nbsp;Open to Full-Time + Consulting
            </m.p>
          </m.div>
        </div>
      </m.section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.92)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: lightboxVisible ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
              padding: "4px 8px",
              transition: "color 0.2s ease",
              zIndex: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          {/* Left arrow */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
              style={{
                position: "absolute",
                left: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44, height: 44,
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "50%",
                color: "#c9a84c",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                transition: "border-color 0.2s ease",
                zIndex: 1,
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          {/* Right arrow */}
          {total > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
              style={{
                position: "absolute",
                right: 20,
                top: "50%",
                transform: "translateY(-50%)",
                width: 44, height: 44,
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "50%",
                color: "#c9a84c",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                transition: "border-color 0.2s ease",
                zIndex: 1,
              }}
              aria-label="Next photo"
            >
              ›
            </button>
          )}

          {/* Photo + caption */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: lightboxPhotoVisible ? "scale(1)" : "scale(0.95)",
              transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
              maxWidth: "90vw",
            }}
          >
            <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh" }}>
              <img
                src={PHOTOS[lightboxIndex].src}
                alt={PHOTOS[lightboxIndex].caption}
                style={{
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: 8,
                  display: "block",
                }}
              />
            </div>
            <p
              style={{
                fontSize: 14,
                color: "#aaa",
                fontStyle: "italic",
                textAlign: "center",
                marginTop: 12,
                maxWidth: "70vw",
                lineHeight: 1.5,
              }}
            >
              {PHOTOS[lightboxIndex].caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
