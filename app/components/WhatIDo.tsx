"use client";

import { useReveal } from "@/app/hooks/useReveal";

const areas = [
  {
    num: "01",
    title: "Customer Operations",
    body: "Building the systems, processes, and communication loops that move customers from interest to adoption — without the chaos.",
  },
  {
    num: "02",
    title: "Enterprise Onboarding & Implementation",
    body: "Rollout plans, training flows, and stakeholder alignment that help teams get value faster.",
  },
  {
    num: "03",
    title: "Technical Solutions & Support",
    body: "Bridging customers, product, and engineering to solve technical problems and reduce friction.",
  },
  {
    num: "04",
    title: "GTM & Cross-Functional Execution",
    body: "Partnering with Sales, Marketing, Product, and Engineering to support demos, launches, feedback loops, and growth.",
  },
];

export default function WhatIDo() {
  const ref = useReveal();

  return (
    <section
      id="work"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal mb-20 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            What I do
          </p>
          <h2
            className="font-bold tracking-tight leading-[1.05]"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Where I create value
          </h2>
        </div>

        {/* Four areas — editorial layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: "var(--border)" }}>
          {areas.map((a, i) => (
            <div
              key={a.num}
              className={`reveal d${i + 1} group p-10 transition-colors duration-300 hover:bg-white/[0.03]`}
              style={{ background: "var(--bg)" }}
            >
              <span className="text-xs font-bold tracking-widest mb-6 block" style={{ color: "var(--muted)" }}>
                {a.num}
              </span>
              <h3
                className="text-2xl font-bold mb-4 group-hover:text-white transition-colors duration-200"
                style={{ color: "var(--head)", letterSpacing: "-0.01em" }}
              >
                {a.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: "var(--body)" }}>
                {a.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
