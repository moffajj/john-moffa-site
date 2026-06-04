"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={
        scrolled
          ? { background: "rgba(0,0,0,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid var(--border)" }
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
            { id: "podcast", label: "Podcast" },
            { id: "experience", label: "Experience" },
            { id: "hobbies", label: "Life" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className="transition-colors duration-200 hover:text-white"
              style={{ color: "var(--body)" }}
            >
              {label}
            </a>
          ))}
        </div>

        <a
          href="#contact"
          className="text-sm font-semibold px-5 py-2 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
          style={{ border: "1px solid var(--border)", color: "var(--head)" }}
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
