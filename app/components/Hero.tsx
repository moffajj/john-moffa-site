export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 15% 60%, rgba(37,99,235,0.18) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(30,58,95,0.25) 0%, transparent 50%), #0f172a",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative max-w-4xl mx-auto w-full py-24">
        <div className="fade-up fade-up-delay-1 mb-5">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase">
            <span className="w-6 h-px bg-blue-400" />
            Customer Operations &amp; Solutions Leader
          </span>
        </div>

        <h1 className="fade-up fade-up-delay-2 text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-8 max-w-3xl">
          Turning customer complexity into{" "}
          <span className="text-blue-400">operational clarity.</span>
        </h1>

        <p className="fade-up fade-up-delay-3 text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
          I&apos;m John Moffa — 15+ years across SaaS, IT Operations, enterprise
          onboarding, technical implementation, support, and go-to-market
          execution.
        </p>

        <div className="fade-up fade-up-delay-4 flex flex-col sm:flex-row gap-3 mb-16">
          <a
            href="#experience"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-md bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors"
          >
            View Experience
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-md border border-slate-600 text-slate-300 font-semibold text-sm hover:border-slate-400 hover:text-white transition-colors"
          >
            Contact Me
          </a>
        </div>

        {/* Stats strip */}
        <div className="fade-up fade-up-delay-4 grid grid-cols-3 gap-6 max-w-lg pt-8 border-t border-slate-800">
          <div>
            <div className="text-3xl font-bold text-white">15+</div>
            <div className="text-xs text-slate-500 mt-1 leading-tight">Years in SaaS &amp; IT Ops</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Full</div>
            <div className="text-xs text-slate-500 mt-1 leading-tight">Customer lifecycle ownership</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">GTM</div>
            <div className="text-xs text-slate-500 mt-1 leading-tight">to Support to Product</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce" aria-hidden="true">
          <path d="M8 3v10M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}
