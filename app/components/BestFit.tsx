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
    <section id="best-fit" className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-500 uppercase mb-4">
            <span className="w-6 h-px bg-blue-500" />
            Open To
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Where I fit best
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {roles.map((role) => (
            <span
              key={role}
              className="inline-block px-4 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-default"
            >
              {role}
            </span>
          ))}
        </div>

        <p className="text-slate-600 text-base leading-relaxed max-w-2xl border-l-4 border-blue-500 pl-5 italic">
          I&apos;m most interested in SaaS companies where customer experience,
          implementation, product feedback, and operational execution are tightly
          connected.
        </p>
      </div>
    </section>
  );
}
