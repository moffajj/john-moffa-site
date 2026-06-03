const services = [
  { icon: "🔍", title: "Onboarding audits", desc: "Find and fix where customers fall off during onboarding." },
  { icon: "🗺️", title: "Implementation process design", desc: "Build rollout frameworks that scale without breaking." },
  { icon: "📞", title: "Support & escalation workflows", desc: "Fix the chaos before it reaches the CEO's inbox." },
  { icon: "🚀", title: "SaaS rollout strategy", desc: "Plan launches that actually land with customers." },
  { icon: "📣", title: "Customer communication & enablement", desc: "Better docs, better training, better adoption." },
  { icon: "🧹", title: "Internal ops & process cleanup", desc: "Untangle the internal processes slowing you down." },
  { icon: "🔄", title: "GTM / customer feedback loops", desc: "Connect what customers say to what the product does." },
];

export default function Consulting() {
  return (
    <section id="consulting" className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            Advisory
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            Consulting &amp; advisory
          </h2>
        </div>

        <p className="text-lg leading-relaxed max-w-2xl mb-12" style={{ color: "var(--body)" }}>
          Open to select consulting projects with SaaS companies that need help with onboarding, customer operations, support workflows, implementation, or internal communication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-base font-bold mb-2" style={{ color: "var(--head)" }}>
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
