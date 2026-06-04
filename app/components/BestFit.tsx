"use client";

import { useReveal } from "@/app/hooks/useReveal";

const roles = [
  "Director of Customer Operations",
  "Head of Customer Operations",
  "Director of Customer Experience & Operations",
  "Director of Enterprise Solutions",
  "Technical Customer Operations",
  "GTM Operations",
  "Solutions Consulting",
  "Implementation Leadership",
  "SaaS Operations",
  "Fractional Customer Operations",
];

export default function BestFit() {
  const ref = useReveal();

  return (
    <section
      id="best-fit"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-16 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Open to
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Where I fit best
          </h2>
        </div>

        <div className="reveal d1 flex flex-wrap gap-3 mb-12">
          {roles.map((role) => (
            <span
              key={role}
              className="text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white hover:text-black cursor-default"
              style={{ border: "1px solid var(--border)", color: "var(--head)" }}
            >
              {role}
            </span>
          ))}
        </div>

        <p
          className="reveal d2 text-lg leading-relaxed max-w-2xl"
          style={{ color: "var(--body)", borderLeft: "2px solid var(--blue)", paddingLeft: "1.25rem" }}
        >
          Most interested in SaaS companies where customer experience, implementation, product feedback, and operational execution are tightly connected.
        </p>
      </div>
    </section>
  );
}
