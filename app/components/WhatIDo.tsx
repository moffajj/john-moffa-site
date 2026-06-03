import TiltCard from "./TiltCard";

const cards = [
  {
    id: "ops",
    label: "01",
    title: "Customer Operations",
    description: "Building the systems, processes, and communication loops that move customers from interest to adoption — without the chaos.",
    span: "lg:col-span-2",
    accent: "#3b82f6",
  },
  {
    id: "gtm",
    label: "02",
    title: "GTM & Cross-Functional Execution",
    description: "Partnering with Sales, Marketing, Product, and Engineering to support demos, launches, feedback loops, and growth.",
    span: "lg:col-span-1 lg:row-span-2",
    accent: "#7c3aed",
  },
  {
    id: "onboard",
    label: "03",
    title: "Enterprise Onboarding & Implementation",
    description: "Designing rollout plans, training flows, and stakeholder alignment that help teams get value faster.",
    span: "lg:col-span-1",
    accent: "#2563eb",
  },
  {
    id: "tech",
    label: "04",
    title: "Technical Solutions & Support",
    description: "Bridging customers, product, and engineering to solve technical problems and reduce friction.",
    span: "lg:col-span-1",
    accent: "#6d28d9",
  },
];

export default function WhatIDo() {
  return (
    <section id="what-i-do" className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            What I do
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            Where I create value
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <TiltCard
              key={card.id}
              className={`group relative rounded-2xl p-7 overflow-hidden cursor-default ${card.span}`}
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {/* Top accent gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${card.accent}, transparent)` }}
              />
              {/* Hover glow */}
              <div
                className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${card.accent}18 0%, transparent 70%)` }}
              />

              <div className="relative h-full flex flex-col">
                <div className="text-xs font-bold tracking-widest mb-4" style={{ color: card.accent }}>
                  {card.label}
                </div>
                <h3
                  className="text-xl font-bold mb-3 group-hover:text-white transition-colors"
                  style={{ color: "var(--head)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed mt-auto" style={{ color: "var(--body)" }}>
                  {card.description}
                </p>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
