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
    <section id="best-fit" className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#1e3a5f] uppercase mb-3">
            Open To
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Where I fit best
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {roles.map((role) => (
            <span
              key={role}
              className="inline-block px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-md"
            >
              {role}
            </span>
          ))}
        </div>

        <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
          I&apos;m most interested in SaaS companies where customer experience,
          implementation, product feedback, and operational execution are tightly
          connected.
        </p>
      </div>
    </section>
  );
}
