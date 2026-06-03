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
    <section id="experience" className="bg-slate-50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
            <span className="w-6 h-px bg-blue-500" />
            Work History
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Experience
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200 hidden md:block" />

          <div className="space-y-8">
            {jobs.map((job) => (
              <div key={job.role} className="relative md:pl-14">
                {/* Timeline dot */}
                <div
                  className={`absolute left-[9px] top-6 w-[11px] h-[11px] rounded-full border-2 hidden md:block ${
                    job.highlight
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-400 bg-white"
                  }`}
                />

                <div
                  className={`bg-white rounded-xl border p-7 transition-all hover:shadow-md ${
                    job.highlight ? "border-blue-200 shadow-sm" : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.role}</h3>
                      {job.company && (
                        <p className="text-blue-600 font-semibold text-sm mt-0.5">
                          {job.company}
                        </p>
                      )}
                    </div>
                    {job.period && (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full shrink-0 self-start">
                        {job.period}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-5">
                    {job.description}
                  </p>

                  {job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md"
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
