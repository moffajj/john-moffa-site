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

export default function Experience() {
  return (
    <section id="experience" className="bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1e3a5f] uppercase mb-3">
            Work History
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Experience
          </h2>
        </div>

        <div className="space-y-10">
          {/* Roam */}
          <div className="bg-white rounded-lg border border-slate-200 p-7">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Director of Customer Operations &amp; Solutions
                </h3>
                <p className="text-[#1e3a5f] font-semibold mt-0.5">Roam</p>
              </div>
              <span className="text-sm text-slate-500 font-medium shrink-0">
                2023 – 2026
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-5">
              Led cross-functional customer operations, enterprise onboarding,
              technical implementation, and go-to-market initiatives for Roam.
              Worked closely with customers throughout the entire lifecycle—from
              initial demos and onboarding through rollout, support, adoption,
              and long-term success. Collaborated daily with Sales, Product,
              Engineering, Marketing, and Executive teams to help customers
              implement Roam effectively, solve technical and operational
              challenges, improve internal processes, and support company growth
              initiatives.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
              {roamResponsibilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-slate-600"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1e3a5f] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Yext */}
          <div className="bg-white rounded-lg border border-slate-200 p-7">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  IT Operations &amp; Project Leadership
                </h3>
                <p className="text-[#1e3a5f] font-semibold mt-0.5">Yext</p>
              </div>
              <span className="text-sm text-slate-500 font-medium shrink-0">
                10+ years
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {yextTitles.map((title) => (
                <span
                  key={title}
                  className="inline-block px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full"
                >
                  {title}
                </span>
              ))}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Spent 10+ years in IT Operations, project leadership, systems
              support, and internal technology operations. Built a strong
              foundation in technical troubleshooting, internal systems,
              infrastructure, stakeholder management, process improvement, and
              operational execution.
            </p>
          </div>

          {/* Co-Founder */}
          <div className="bg-white rounded-lg border border-slate-200 p-7">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Co-Founder</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Built and operated a business with responsibility across
              operations, customer relationships, technology, and execution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
