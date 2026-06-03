"use client";

const roles = [
  { title: "Director of Customer Operations", hot: true },
  { title: "Head of Customer Operations", hot: true },
  { title: "Director of Customer Experience & Operations", hot: false },
  { title: "Director of Enterprise Solutions", hot: true },
  { title: "Technical Customer Operations", hot: false },
  { title: "GTM Operations", hot: false },
  { title: "Solutions Consulting", hot: false },
  { title: "Implementation Leadership", hot: false },
  { title: "SaaS Operations", hot: false },
  { title: "Fractional Customer Operations", hot: false },
];

export default function BestFit() {
  return (
    <section id="best-fit" className="py-24 px-6" style={{ background: "var(--bg-2)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            Job search
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            Where I fit best
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold cursor-default transition-all duration-200 hover:scale-105"
              style={{
                background: role.hot ? "rgba(99,102,241,0.12)" : "var(--card)",
                border: role.hot ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border)",
                color: role.hot ? "#a5b4fc" : "var(--head)",
              }}
            >
              {role.hot && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: "#818cf8" }}
                />
              )}
              {role.title}
            </div>
          ))}
        </div>

        <p
          className="text-base leading-relaxed max-w-2xl pl-5 italic"
          style={{ color: "var(--body)", borderLeft: "3px solid var(--blue)" }}
        >
          I&apos;m most interested in SaaS companies where customer experience, implementation, product feedback, and operational execution are tightly connected.
        </p>
      </div>
    </section>
  );
}
