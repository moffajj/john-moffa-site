const cards = [
  {
    number: "01",
    title: "Customer Operations",
    description:
      "Building the systems, processes, and communication loops that help customers move from interest to adoption without chaos.",
  },
  {
    number: "02",
    title: "Enterprise Onboarding & Implementation",
    description:
      "Designing rollout plans, training flows, stakeholder alignment, and implementation processes that help teams get value faster.",
  },
  {
    number: "03",
    title: "Technical Solutions & Support",
    description:
      "Bridging customers, product, engineering, and internal teams to solve technical problems, reduce friction, and improve the customer experience.",
  },
  {
    number: "04",
    title: "GTM & Cross-Functional Execution",
    description:
      "Partnering with Sales, Marketing, Product, Engineering, and Leadership to support demos, launches, customer communication, feedback loops, and growth initiatives.",
  },
];

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
            <span className="w-6 h-px bg-blue-500" />
            Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Where I create value
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative bg-slate-50 rounded-xl p-7 border border-slate-200 hover:border-blue-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div className="text-xs font-bold text-blue-400 tracking-widest mb-4">
                {card.number}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {card.description}
              </p>
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-500 rounded-full group-hover:w-full transition-all duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
