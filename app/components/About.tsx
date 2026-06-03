export default function About() {
  return (
    <section id="about" className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
            <span className="w-6 h-px bg-blue-500" />
            Background
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            About
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-12 items-start">
          <div className="md:col-span-3 space-y-5 text-slate-700 text-base leading-relaxed">
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

          <div className="md:col-span-2 space-y-3">
            {[
              { label: "Based in", value: "New York" },
              { label: "Previously", value: "Roam · Yext" },
              { label: "Focused on", value: "SaaS Operations" },
              { label: "Available for", value: "Full-time · Consulting" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between py-3 border-b border-slate-100 text-sm"
              >
                <span className="text-slate-500 font-medium">{item.label}</span>
                <span className="text-slate-900 font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
