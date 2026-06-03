const services = [
  "Customer onboarding audits",
  "Implementation process design",
  "Support and escalation workflow improvement",
  "SaaS rollout strategy",
  "Customer communication and enablement",
  "Internal operations and process cleanup",
  "GTM/customer feedback loops",
];

export default function Consulting() {
  return (
    <section id="consulting" className="bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1e3a5f] uppercase mb-3">
            Advisory
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Consulting &amp; advisory
          </h2>
        </div>

        <p className="text-slate-600 text-base leading-relaxed max-w-2xl mb-8">
          I&apos;m also open to select consulting projects with SaaS companies
          that need help improving onboarding, customer operations, support
          workflows, implementation processes, or internal communication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service}
              className="flex items-start gap-3 bg-white rounded-md border border-slate-200 px-4 py-3"
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1e3a5f] shrink-0" />
              <span className="text-sm text-slate-700">{service}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
