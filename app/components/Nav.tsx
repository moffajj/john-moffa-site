"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? {
              background: "rgba(13,17,23,0.9)",
              backdropFilter: "blur(16px)",
              borderBottom: "1px solid var(--border)",
            }
          : { background: "transparent" }
      }
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span
          className="font-bold text-sm tracking-tight"
          style={{ color: "var(--text-head)" }}
        >
          John Moffa
        </span>
        <div className="hidden sm:flex items-center gap-7 text-sm">
          {[
            { id: "what-i-do", label: "Expertise" },
            { id: "experience", label: "Experience" },
            { id: "consulting", label: "Consulting" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="transition-colors hover:text-blue-400"
              style={{ color: "var(--text-body)" }}
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-lg bg-blue-500 text-white font-semibold text-xs hover:bg-blue-400 transition-colors"
          >
            Contact
          </a>
        </div>
        <a
          href="#contact"
          className="sm:hidden px-4 py-1.5 rounded-lg bg-blue-500 text-white font-semibold text-sm"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
