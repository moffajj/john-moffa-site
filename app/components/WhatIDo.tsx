const cards = [
  {
    title: "Customer Operations",
    description:
      "Building the systems, processes, and communication loops that help customers move from interest to adoption without chaos.",
    icon: "⚙️",
  },
  {
    title: "Enterprise Onboarding & Implementation",
    description:
      "Designing rollout plans, training flows, stakeholder alignment, and implementation processes that help teams get value faster.",
    icon: "🗂️",
  },
  {
    title: "Technical Solutions & Support",
    description:
      "Bridging customers, product, engineering, and internal teams to solve technical problems, reduce friction, and improve the customer experience.",
    icon: "🔧",
  },
  {
    title: "GTM & Cross-Functional Execution",
    description:
      "Partnering with Sales, Marketing, Product, Engineering, and Leadership to support demos, launches, customer communication, feedback loops, and growth initiatives.",
    icon: "📡",
  },
];

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1e3a5f] uppercase mb-3">
            Expertise
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Where I create value
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg p-6 border border-slate-200 hover:border-[#1e3a5f]/30 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-4">{card.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
