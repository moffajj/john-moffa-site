import Image from "next/image";

const facts = [
  { emoji: "📍", label: "Based in", value: "New York" },
  { emoji: "💼", label: "Last role", value: "Roam" },
  { emoji: "🏗️", label: "Before that", value: "Yext, 10+ years" },
  { emoji: "🎯", label: "Best at", value: "The messy middle" },
  { emoji: "🤝", label: "Open to", value: "Full-time & Consulting" },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6" style={{ background: "var(--bg-2)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            The story
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            About me
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Photo */}
          <div className="lg:col-span-1 flex justify-center lg:justify-start">
            <div className="relative w-64 lg:w-full max-w-xs">
              <div
                className="absolute -inset-[2px] rounded-2xl opacity-50"
                style={{ background: "var(--grad)" }}
              />
              <div className="relative rounded-2xl overflow-hidden aspect-square">
                <Image
                  src="/headshot.jpg"
                  alt="John Moffa"
                  fill
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="lg:col-span-2 space-y-5 text-base leading-relaxed" style={{ color: "var(--body)" }}>
            <p className="text-xl font-semibold italic" style={{ color: "var(--head)" }}>
              &ldquo;I&apos;ve spent my career in the messy middle between customers, technical teams, and business operations.&rdquo;
            </p>
            <p>
              At Roam, I worked across customer operations, onboarding, support, technical implementation, product feedback, sales support, and go-to-market execution. My role was broad by design: help customers get implemented successfully, solve real problems, and make sure the right feedback made it back to the team.
            </p>
            <p>
              Before Roam, I spent over a decade in IT Operations and project leadership at Yext — which gave me a technical foundation and a ground-level understanding of how companies actually work, not just how they look on paper.
            </p>
            <p>
              I&apos;m at my best when the job isn&apos;t neatly boxed into one department. I connect the dots between customers, product, process, and execution.
            </p>

            {/* Fact strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{f.label}</div>
                    <div className="text-sm font-semibold" style={{ color: "var(--head)" }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
