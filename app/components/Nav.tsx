"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
          ? { background: "rgba(7,11,20,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border)" }
          : { background: "transparent" }
      }
    >
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500/30">
            <Image src="/headshot.jpg" alt="John Moffa" fill className="object-cover object-top" />
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--head)" }}>
            John Moffa
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-7 text-sm">
          {[
            { id: "what-i-do", label: "Expertise" },
            { id: "podcast", label: "Podcast" },
            { id: "experience", label: "Experience" },
            { id: "consulting", label: "Consulting" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="transition-colors hover:text-white"
              style={{ color: "var(--body)" }}
            >
              {label}
            </a>
          ))}
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-lg text-white font-semibold text-xs transition-all hover:opacity-90"
            style={{ background: "var(--grad)" }}
          >
            Contact
          </a>
        </div>

        <a
          href="#contact"
          className="sm:hidden px-4 py-1.5 rounded-lg text-white font-semibold text-sm"
          style={{ background: "var(--grad)" }}
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
