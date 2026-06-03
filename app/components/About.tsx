export default function About() {
  const facts = [
    { label: "Based in", value: "New York" },
    { label: "Previously", value: "Roam · Yext" },
    { label: "Focused on", value: "SaaS Operations" },
    { label: "Available for", value: "Full-time · Consulting" },
  ];

  return (
    <section
      id="about"
      className="py-24 px-6"
      style={{ background: "var(--bg-deep)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">
            <span className="w-6 h-px bg-blue-400" />
            Background
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold tracking-tight"
            style={{ color: "var(--text-head)" }}
          >
            About
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-14 items-start">
          <div
            className="md:col-span-3 space-y-5 text-base leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            <p>
              I&apos;ve spent my career working in the messy middle between
              customers, technical teams, and business operations.
            </p>
            <p>
              At Roam, I worked across customer operations, onboarding, support,
              technical implementation, product feedback, sales support, marketing
              initiatives, and go-to-market execution. My role was broad by
              design: help customers understand the product, get implemented
              successfully, solve technical and operational challenges, and make
              sure the right feedback made its way back to the team.
            </p>
            <p>
              Before Roam, I spent over a decade in IT Operations and project
              leadership, giving me a strong technical foundation and a practical
              understanding of how companies actually operate.
            </p>
            <p>
              I&apos;m at my best in roles where the job is not neatly boxed into
              one department. I help companies connect the dots between customers,
              product, process, and execution.
            </p>
          </div>

          <div className="md:col-span-2 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {facts.map((item, i) => (
              <div
                key={item.label}
                className="flex justify-between items-center px-5 py-4 text-sm"
                style={{
                  borderBottom: i < facts.length - 1 ? "1px solid var(--border)" : "none",
                  background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-2)",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                <span className="font-semibold" style={{ color: "var(--text-head)" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
