"use client";

import { useEffect, useRef, useState } from "react";

const NAV_ITEMS = [
  {
    id: "work",
    label: "Work",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    id: "experience",
    label: "Experience",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "agents",
    label: "Agents",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
        <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
      </svg>
    ),
  },
  {
    id: "podcast",
    label: "Podcast",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="9" y1="22" x2="15" y2="22" />
      </svg>
    ),
  },
  {
    id: "hobbies",
    label: "Life",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function MobileNav() {
  const [activeId, setActiveId] = useState<string>("work");
  const [isScrolling, setIsScrolling] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tappedId, setTappedId] = useState<string | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fade in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Intersection Observer for active section
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.id);
    const observers: IntersectionObserver[] = [];

    const visibleMap: Record<string, number> = {};

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.intersectionRatio;
          // Pick the section with highest intersection ratio
          const best = Object.entries(visibleMap).sort((a, b) => b[1] - a[1])[0];
          if (best && best[1] > 0) setActiveId(best[0]);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1.0], rootMargin: "-20% 0px -20% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Scroll shrink behavior
  useEffect(() => {
    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  function handleTap(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });

    setTappedId(id);
    setTimeout(() => setTappedId(null), 350);
  }

  return (
    <>
    <style>{`
      .mobile-pill-nav { display: none; }
      @media (max-width: 768px) { .mobile-pill-nav { display: flex; } }
    `}</style>
    <nav
      aria-label="Mobile navigation"
      className="mobile-pill-nav"
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: `translateX(-50%) ${isScrolling ? "scale(0.92)" : "scale(1)"} ${visible ? "translateY(0px)" : "translateY(24px)"}`,
        opacity: visible ? (isScrolling ? 0.7 : 1) : 0,
        background: "rgba(18,18,18,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid #2a2a2a",
        borderRadius: 50,
        padding: "10px 20px",
        alignItems: "center",
        gap: 20,
        zIndex: 1000,
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeId === item.id;
        const isTapped = tappedId === item.id;

        return (
          <button
            key={item.id}
            onClick={() => handleTap(item.id)}
            aria-label={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              color: isActive ? "#c9a84c" : "#666",
              transform: isTapped ? "scale(1.15)" : "scale(1)",
              transition: "color 0.2s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", lineHeight: 1 }}>
              {item.label}
            </span>
            {/* Active dot */}
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: isActive ? "#c9a84c" : "transparent",
                transition: "background 0.2s ease",
                marginTop: 1,
              }}
            />
          </button>
        );
      })}
    </nav>
    </>
  );
}
