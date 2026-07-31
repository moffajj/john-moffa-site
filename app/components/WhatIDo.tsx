"use client";

import { m } from "framer-motion";
import { useReveal } from "@/app/hooks/useReveal";

const areas = [
  {
    title: "Customer Operations",
    body: "Building the systems, processes, and communication loops that move customers from interest to adoption, without the chaos.",
  },
  {
    title: "Enterprise Onboarding & Implementation",
    body: "Rollout plans, training flows, and stakeholder alignment that help teams get value faster.",
  },
  {
    title: "Technical Support & Solutions Engineering",
    body: "Bridging the technical and the human, translating complex product capabilities into clear solutions that map to real customer problems, and solving the hard ones when they escalate.",
  },
  {
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
            style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
          >
            Where I create value
          </h2>
        </div>

        {/* Four areas — editorial layout */}
        <m.div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 16 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          whileInView="show"
          initial="hidden"
          viewport={{ once: true, margin: "-80px" }}
        >
          {areas.map((a, i) => (
            <m.div
              key={a.title}
              className={`value-card reveal d${i + 1}`}
              style={{ background: "#0f0f0f", padding: 36 }}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
            >
              <h3
                className="value-card-title text-2xl font-bold mb-4"
                style={{ color: "var(--head)", letterSpacing: "-0.01em", transition: "color 0.25s ease" }}
              >
                {a.title}
              </h3>
              <p className="value-card-body text-base leading-relaxed" style={{ color: "var(--body)", transition: "color 0.25s ease" }}>
                {a.body}
              </p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
