"use client";

const roles = [
  "Director of Customer Operations",
  "Head of Customer Operations",
  "Director of Customer Experience & Operations",
  "Director of Enterprise Solutions",
  "Technical Customer Operations",
  "GTM Operations",
  "Solutions Consulting",
  "Implementation Leadership",
  "SaaS Operations",
  "Fractional Customer Operations",
];

export default function BestFit() {
  return (
    <section
      id="best-fit"
      className="py-24 px-6"
      style={{ background: "var(--bg-deep)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
            <span className="w-6 h-px bg-blue-400" />
            Open To
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-head)" }}
          >
            Where I fit best
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {roles.map((role) => (
            <span
              key={role}
              className="inline-block px-4 py-2.5 text-sm font-semibold rounded-lg cursor-default transition-all hover:scale-105 hover:shadow-lg"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-head)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(96,165,250,0.4)";
                el.style.color = "#60a5fa";
                el.style.background = "var(--bg-card-2)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--text-head)";
                el.style.background = "var(--bg-card)";
              }}
            >
              {role}
            </span>
          ))}
        </div>

        <p
          className="text-base leading-relaxed max-w-2xl pl-5 italic"
          style={{
            color: "var(--text-body)",
            borderLeft: "3px solid #3b82f6",
          }}
        >
          I&apos;m most interested in SaaS companies where customer experience,
          implementation, product feedback, and operational execution are tightly
          connected.
        </p>
      </div>
    </section>
  );
}
