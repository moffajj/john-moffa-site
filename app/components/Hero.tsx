export default function Hero() {
  return (
    <section
      id="hero"
      className="bg-white pt-20 pb-24 px-6 md:pt-28 md:pb-32"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="inline-block text-sm font-medium tracking-widest text-slate-500 uppercase">
            Customer Operations &amp; Solutions Leader
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6 max-w-3xl">
          Helping SaaS companies turn customer complexity into operational
          clarity.
        </h1>

        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl">
          I&apos;m John Moffa, a customer operations and solutions leader with
          15+ years across SaaS, IT Operations, enterprise onboarding, technical
          implementation, support, and go-to-market execution.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <a
            href="#experience"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#1e3a5f] text-white font-medium text-sm hover:bg-[#16304f] transition-colors"
          >
            View Experience
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-slate-300 text-slate-700 font-medium text-sm hover:border-slate-400 hover:bg-slate-50 transition-colors"
          >
            Contact Me
          </a>
        </div>

        <p className="text-sm text-slate-500">
          Formerly at{" "}
          <span className="font-medium text-slate-700">Roam</span>.
          Previously led IT Operations and technical projects across
          high-growth environments.
        </p>
      </div>
    </section>
  );
}
