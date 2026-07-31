"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { m, useScroll, useTransform } from "framer-motion";

const NAV_IDS = ["work", "experience", "agents", "podcast", "hobbies"];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.85]);
  const blurVal = useTransform(scrollY, [0, 80], [0, 12]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const visibleMap: Record<string, number> = {};
    const observers: IntersectionObserver[] = [];

    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          visibleMap[id] = entry.intersectionRatio;
          const best = Object.entries(visibleMap).sort((a, b) => b[1] - a[1])[0];
          if (best && best[1] > 0) setActiveId(best[0]);
        },
        { threshold: [0, 0.25, 0.5], rootMargin: "-20% 0px -20% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <m.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={
        scrolled
          ? { background: `rgba(0,0,0,${bgOpacity.get()})`, backdropFilter: `blur(${blurVal.get()}px)`, borderBottom: "1px solid var(--border)" }
          : { background: "transparent" }
      }
    >
      <nav className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-white/20">
            <Image src="/headshot.jpg" alt="John Moffa" fill className="object-cover object-top" />
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--head)" }}>
            John Moffa
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          {[
            { id: "work", label: "Work" },
            { id: "experience", label: "Experience" },
            { id: "agents", label: "Agents" },
            { id: "podcast", label: "Podcast" },
            { id: "hobbies", label: "Life" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                color: activeId === id ? "#c9a84c" : "var(--body)",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
              onMouseLeave={(e) => (e.currentTarget.style.color = activeId === id ? "#c9a84c" : "var(--body)")}
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="rounded-full transition-all duration-200 hover:bg-white hover:text-black inline-flex items-center"
          style={{ height: 48, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: "var(--blue)", color: "#fff", borderRadius: 30 }}
        >
          Contact
        </a>
      </nav>
    </m.header>
  );
}
