"use client";

import { useReveal } from "@/app/hooks/useReveal";

const services = [
  { title: "Onboarding audits", body: "Find exactly where customers fall off and fix it." },
  { title: "Implementation process design", body: "Build rollout frameworks that scale without breaking." },
  { title: "Support & escalation workflows", body: "Fix the chaos before it reaches the executive team." },
  { title: "SaaS rollout strategy", body: "Plan launches that actually land with customers." },
  { title: "Customer communication & enablement", body: "Better training, better docs, better adoption." },
  { title: "Internal ops & process cleanup", body: "Untangle the internal processes slowing you down." },
  { title: "GTM / customer feedback loops", body: "Connect what customers say to what the product does." },
];

export default function Consulting() {
  const ref = useReveal();

  return (
    <section
      id="consulting"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 mb-20">
          <div className="reveal">
            <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
              Advisory
            </p>
            <h2
              className="font-bold tracking-tight"
              style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
            >
              Consulting &amp; advisory
            </h2>
          </div>
          <div className="reveal d1 flex items-center">
            <p className="text-lg leading-relaxed" style={{ color: "var(--body)" }}>
              Open to select projects with SaaS companies that need help with onboarding, customer operations, support workflows, implementation, or internal communication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`reveal d${Math.min(i + 1, 5)} group p-8 transition-colors duration-300 hover:bg-white/[0.04]`}
              style={{ background: "var(--bg-1)" }}
            >
              <div className="w-8 h-px mb-6 transition-all duration-300 group-hover:w-16" style={{ background: "var(--blue)" }} />
              <h3
                className="text-base font-bold mb-3 group-hover:text-white transition-colors"
                style={{ color: "var(--head)" }}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
