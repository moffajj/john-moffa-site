"use client";

import { useEffect, useState } from "react";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span
          className={`font-bold text-sm tracking-tight transition-colors ${
            scrolled ? "text-slate-900" : "text-white"
          }`}
        >
          John Moffa
        </span>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          {["what-i-do", "experience", "consulting"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={`capitalize transition-colors hover:text-blue-500 ${
                scrolled ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {id === "what-i-do" ? "Expertise" : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-400 transition-colors"
          >
            Contact
          </a>
        </div>
        <a
          href="#contact"
          className="sm:hidden px-4 py-1.5 rounded-md bg-blue-500 text-white font-medium text-sm"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
