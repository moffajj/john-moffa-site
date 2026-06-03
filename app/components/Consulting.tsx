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
    <section
      id="consulting"
      className="py-24 px-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
            <span className="w-6 h-px bg-blue-400" />
            Advisory
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-head)" }}
          >
            Consulting &amp; advisory
          </h2>
        </div>

        <p
          className="text-base leading-relaxed max-w-2xl mb-10"
          style={{ color: "var(--text-body)" }}
        >
          I&apos;m also open to select consulting projects with SaaS companies
          that need help improving onboarding, customer operations, support
          workflows, implementation processes, or internal communication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service}
              className="flex items-center gap-3 rounded-lg px-4 py-3.5 transition-all hover:translate-x-1 duration-150"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: "#3b82f6" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-body)" }}
              >
                {service}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
