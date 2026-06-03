import TiltCard from "./TiltCard";

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
    <section
      id="what-i-do"
      className="py-24 px-6"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
            <span className="w-6 h-px bg-blue-400" />
            Expertise
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-head)" }}
          >
            Where I create value
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => (
            <TiltCard
              key={card.title}
              className="group relative rounded-xl p-7 overflow-hidden cursor-default"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              {/* inner glow on hover via pseudo-like overlay */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)",
                }}
              />
              {/* top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="text-xs font-bold text-blue-500 tracking-widest mb-4">
                  {card.number}
                </div>
                <h3
                  className="text-lg font-bold mb-3 group-hover:text-blue-400 transition-colors"
                  style={{ color: "var(--text-head)" }}
                >
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
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
