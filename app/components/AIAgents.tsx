"use client";

import dynamic from "next/dynamic";
import { useReveal } from "@/app/hooks/useReveal";

const MeetingPrepAgent = dynamic(
  () => import("@/app/components/agents/MeetingPrepAgent"),
  { ssr: false }
);

const SupportTriageAgent = dynamic(
  () => import("@/app/components/agents/SupportTriageAgent"),
  { ssr: false }
);

export default function AIAgents() {
  const ref = useReveal();

  return (
    <section
      id="agents"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal mb-16 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Built by me
          </p>
          <h2
            className="mb-4"
            style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
          >
            AI Agents
          </h2>
          <p className="text-base" style={{ color: "var(--body)" }}>
            Practical agents I&apos;ve built to make operations work faster.
          </p>
        </div>

        {/* Agent cards */}
        <div className="reveal-scale">
          <MeetingPrepAgent />
        </div>

        <div className="reveal-scale mt-12">
          <SupportTriageAgent />
        </div>
      </div>
    </section>
  );
}
