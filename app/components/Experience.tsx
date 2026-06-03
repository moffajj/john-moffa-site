const roamResponsibilities = [
  "Enterprise onboarding & implementation",
  "Customer operations & lifecycle management",
  "Technical support & escalation management",
  "Pre-sales and solutions consulting",
  "Product feedback & operational collaboration",
  "Remote workplace operations & workflow design",
  "Process optimization & internal systems",
  "Customer training, enablement & adoption strategy",
  "Cross-functional coordination between GTM, Product, and Engineering teams",
];

const yextTitles = [
  "Head of IT Operations",
  "Principal IT Project Manager",
  "Senior IT Project Manager",
  "IT Support Engineer",
];

const jobs = [
  {
    role: "Director of Customer Operations & Solutions",
    company: "Roam",
    period: "2023 – 2026",
    description:
      "Led cross-functional customer operations, enterprise onboarding, technical implementation, and go-to-market initiatives. Worked closely with customers throughout the entire lifecycle—from initial demos and onboarding through rollout, support, adoption, and long-term success. Collaborated daily with Sales, Product, Engineering, Marketing, and Executive teams.",
    tags: roamResponsibilities,
    highlight: true,
  },
  {
    role: "IT Operations & Project Leadership",
    company: "Yext",
    period: "10+ years",
    description:
      "Spent 10+ years in IT Operations, project leadership, systems support, and internal technology operations. Built a strong foundation in technical troubleshooting, internal systems, infrastructure, stakeholder management, process improvement, and operational execution.",
    tags: yextTitles,
    highlight: false,
  },
  {
    role: "Co-Founder",
    company: "",
    period: "",
    description:
      "Built and operated a business with responsibility across operations, customer relationships, technology, and execution.",
    tags: [],
    highlight: false,
  },
];

export default function Experience() {
  return (
    <section
      id="experience"
      className="py-24 px-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
            <span className="w-6 h-px bg-blue-400" />
            Work History
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-head)" }}
          >
            Experience
          </h2>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[15px] top-3 bottom-3 w-px hidden md:block"
            style={{ background: "var(--border)" }}
          />

          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.role} className="relative md:pl-12">
                {/* Timeline dot */}
                <div
                  className={`absolute left-[9px] top-7 w-[13px] h-[13px] rounded-full hidden md:block transition-all`}
                  style={{
                    background: job.highlight ? "#3b82f6" : "var(--bg-card)",
                    border: job.highlight
                      ? "2px solid #60a5fa"
                      : "2px solid var(--text-muted)",
                    boxShadow: job.highlight
                      ? "0 0 12px rgba(59,130,246,0.6)"
                      : "none",
                  }}
                />

                <div
                  className="rounded-xl p-7 transition-all hover:translate-y-[-2px] duration-200"
                  style={{
                    background: "var(--bg-card)",
                    border: job.highlight
                      ? "1px solid rgba(59,130,246,0.25)"
                      : "1px solid var(--border)",
                    boxShadow: job.highlight
                      ? "0 0 30px rgba(59,130,246,0.05)"
                      : "none",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "var(--text-head)" }}
                      >
                        {job.role}
                      </h3>
                      {job.company && (
                        <p className="text-blue-400 font-semibold text-sm mt-0.5">
                          {job.company}
                        </p>
                      )}
                    </div>
                    {job.period && (
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full shrink-0 self-start"
                        style={{
                          background: "var(--bg-card-2)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {job.period}
                      </span>
                    )}
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: "var(--text-body)" }}
                  >
                    {job.description}
                  </p>

                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2.5 py-1 text-xs font-medium rounded-md"
                          style={{
                            background: "var(--bg-card-2)",
                            color: "var(--text-body)",
                            border: "1px solid var(--border)",
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
      </div>
    </section>
  );
}
