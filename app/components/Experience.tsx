"use client";

import { useReveal } from "@/app/hooks/useReveal";

const jobs = [
  {
    role: "Director of Customer Operations & Solutions",
    company: "Roam",
    period: "2023 – 2026",
    type: "SaaS · Remote Collaboration",
    description:
      "Led cross-functional customer operations, enterprise onboarding, technical implementation, and go-to-market for a high-growth remote collaboration platform. Worked the full customer lifecycle — demos, onboarding, rollout, support, adoption — while collaborating daily with Sales, Product, Engineering, and Marketing.",
    tags: [
      "Enterprise onboarding",
      "Customer lifecycle management",
      "Technical support & escalation",
      "Pre-sales consulting",
      "Product feedback loops",
      "Remote workplace ops",
      "Process optimization",
      "Customer enablement",
      "GTM coordination",
    ],
    featured: true,
  },
  {
    role: "IT Operations & Project Leadership",
    company: "Yext",
    period: "10+ years",
    type: "Enterprise SaaS",
    description:
      "Grew from IT Support Engineer to Head of IT Operations over 10+ years. Built and scaled internal IT infrastructure, led projects across systems, stakeholder management, and operational execution.",
    tags: ["Head of IT Operations", "Principal IT PM", "Senior IT PM", "IT Support Engineer"],
    featured: false,
  },
  {
    role: "Co-Founder",
    company: "",
    period: "",
    type: "Entrepreneurship",
    description:
      "Built and operated a business with full ownership across operations, customer relationships, technology, and execution.",
    tags: [],
    featured: false,
  },
];

export default function Experience() {
  const ref = useReveal();

  return (
    <section
      id="experience"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-20 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Career
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Experience
          </h2>
        </div>

        <div className="space-y-px" style={{ borderTop: "1px solid var(--border)" }}>
          {jobs.map((job, i) => (
            <div
              key={job.role}
              className={`reveal d${i + 1} group py-10 border-b grid grid-cols-1 lg:grid-cols-12 gap-6 transition-colors duration-300 hover:bg-white/[0.02]`}
              style={{ borderColor: "var(--border)" }}
            >
              {/* Left: meta */}
              <div className="lg:col-span-3">
                {job.company && (
                  <div
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--blue-2)" }}
                  >
                    {job.company}
                  </div>
                )}
                {job.period && (
                  <div className="text-sm mb-1" style={{ color: "var(--muted)" }}>{job.period}</div>
                )}
                <div className="text-xs" style={{ color: "var(--muted)" }}>{job.type}</div>
              </div>

              {/* Right: content */}
              <div className="lg:col-span-9">
                <h3
                  className="text-xl font-bold mb-4 group-hover:text-white transition-colors"
                  style={{ color: "var(--head)", letterSpacing: "-0.01em" }}
                >
                  {job.role}
                </h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--body)" }}>
                  {job.description}
                </p>
                {job.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: job.featured ? "rgba(0,113,227,0.1)" : "var(--card)",
                          color: job.featured ? "var(--blue-2)" : "var(--body)",
                          border: `1px solid ${job.featured ? "rgba(0,113,227,0.2)" : "var(--border)"}`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
