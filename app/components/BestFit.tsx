"use client";

import { useReveal } from "@/app/hooks/useReveal";

const roles = [
  "Director of Customer Operations",
  "Head of Customer Operations",
  "Director of Customer Experience & Operations",
  "Head of IT Operations",
  "Director of IT Operations",
  "Director of Technical Solutions",
  "Head of Technical Onboarding",
  "Head of Implementation",
  "Director of Technical Account Management",
  "Head of Customer Success",
  "Director of GTM Operations",
  "Implementation Leadership",
  "Solutions Engineer",
  "AI Outcomes",
  "Technical Delivery",
  "Professional Services",
  "AI Transformation",
  "Customer Solutions Architect",
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
            style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
          >
            Where I fit best
          </h2>
        </div>

        <div className="reveal d1 flex flex-wrap gap-3 mb-12">
          {roles.map((role) => (
            <span
              key={role}
              className="text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white hover:text-black cursor-default text-white"
              style={{ border: "1px solid var(--border)" }}
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
