const jobs = [
  {
    role: "Director of Customer Operations & Solutions",
    company: "Roam",
    period: "2023 – 2026",
    type: "SaaS · Remote Collaboration",
    description:
      "Led cross-functional customer operations, enterprise onboarding, technical implementation, and go-to-market for a high-growth remote collaboration platform. Worked the full customer lifecycle — demos, onboarding, rollout, support, adoption, and feedback loops — while collaborating daily with Sales, Product, Engineering, and Marketing.",
    tags: [
      "Enterprise onboarding & implementation",
      "Customer operations & lifecycle management",
      "Technical support & escalation management",
      "Pre-sales and solutions consulting",
      "Product feedback & collaboration",
      "Remote workplace operations",
      "Process optimization",
      "Customer training & enablement",
      "GTM + Product + Engineering coordination",
    ],
    highlight: true,
  },
  {
    role: "IT Operations & Project Leadership",
    company: "Yext",
    period: "10+ years",
    type: "Enterprise SaaS · AI Search",
    description:
      "10+ years across IT Operations and project leadership. Grew from IT Support Engineer to Head of IT Operations, building a strong technical foundation in infrastructure, systems, stakeholder management, and operational execution.",
    tags: [
      "Head of IT Operations",
      "Principal IT Project Manager",
      "Senior IT Project Manager",
      "IT Support Engineer",
    ],
    highlight: false,
  },
  {
    role: "Co-Founder",
    company: "",
    period: "",
    type: "Entrepreneurship",
    description:
      "Built and operated a business with full ownership across operations, customer relationships, technology, and execution.",
    tags: [],
    highlight: false,
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            Career
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            Experience
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[19px] top-4 bottom-4 w-px hidden md:block"
            style={{ background: "var(--border)" }}
          />

          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.role} className="relative md:pl-14">
                {/* Dot */}
                <div
                  className="absolute left-[12px] top-7 w-[15px] h-[15px] rounded-full hidden md:block"
                  style={{
                    background: job.highlight ? "var(--grad)" : "var(--card)",
                    border: job.highlight ? "none" : "2px solid var(--muted)",
                    boxShadow: job.highlight ? "0 0 16px rgba(99,102,241,0.6)" : "none",
                  }}
                />

                <div
                  className="rounded-2xl p-7 transition-all duration-200 hover:translate-y-[-2px] hover:shadow-2xl group"
                  style={{
                    background: "var(--card)",
                    border: job.highlight ? "1px solid rgba(99,102,241,0.25)" : "1px solid var(--border)",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: "var(--head)" }}>
                        {job.role}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {job.company && (
                          <span
                            className="text-sm font-semibold"
                            style={{
                              background: "var(--grad)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {job.company}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "var(--muted)" }}>{job.type}</span>
                      </div>
                    </div>
                    {job.period && (
                      <span
                        className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 self-start"
                        style={{ background: "var(--bg-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                      >
                        {job.period}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed mb-5 mt-3" style={{ color: "var(--body)" }}>
                    {job.description}
                  </p>

                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 text-xs font-medium rounded-lg"
                          style={{ background: "var(--bg-2)", color: "var(--body)", border: "1px solid var(--border)" }}
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
      </div>
    </section>
  );
}
