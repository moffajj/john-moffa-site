"use client";

import WireframeSphere from "./WireframeSphere";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      {/* Ambient glow blobs */}
      <div
        className="glow-pulse absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="glow-pulse absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--text-head) 1px, transparent 1px), linear-gradient(90deg, var(--text-head) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      {/* Two-column layout */}
      <div className="relative max-w-5xl mx-auto w-full py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <div>
          <div className="fade-up fade-up-d1 mb-5 flex items-center gap-2">
            <span className="w-6 h-px bg-blue-400" />
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Customer Operations &amp; Solutions Leader
            </span>
          </div>

          <h1
            className="fade-up fade-up-d2 text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight mb-6"
            style={{ color: "var(--text-head)" }}
          >
            Turning customer complexity into{" "}
            <span className="text-blue-400">operational clarity.</span>
          </h1>

          <p
            className="fade-up fade-up-d3 text-lg leading-relaxed mb-10 max-w-lg"
            style={{ color: "var(--text-body)" }}
          >
            I&apos;m John Moffa — 15+ years across SaaS, IT Operations,
            enterprise onboarding, technical implementation, support, and
            go-to-market execution.
          </p>

          <div className="fade-up fade-up-d4 flex flex-col sm:flex-row gap-3 mb-14">
            <a
              href="#experience"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-blue-500 text-white font-semibold text-sm hover:bg-blue-400 transition-colors"
            >
              View Experience
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg font-semibold text-sm transition-colors"
              style={{
                border: "1px solid var(--border)",
                color: "var(--text-body)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(96,165,250,0.4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-head)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-body)";
              }}
            >
              Contact Me
            </a>
          </div>

          {/* Stats */}
          <div
            className="fade-up fade-up-d4 grid grid-cols-3 gap-6 pt-8"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div>
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--text-head)" }}
              >
                15+
              </div>
              <div
                className="text-xs mt-1 leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                Years in SaaS &amp; IT Ops
              </div>
            </div>
            <div>
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--text-head)" }}
              >
                Full
              </div>
              <div
                className="text-xs mt-1 leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                Customer lifecycle ownership
              </div>
            </div>
            <div>
              <div
                className="text-3xl font-bold"
                style={{ color: "var(--text-head)" }}
              >
                GTM
              </div>
              <div
                className="text-xs mt-1 leading-tight"
                style={{ color: "var(--text-muted)" }}
              >
                to Support to Product
              </div>
            </div>
          </div>
        </div>

        {/* Right: 3D sphere */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-[420px] h-[420px] relative">
            {/* Outer ring glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
              }}
            />
            <WireframeSphere />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="animate-bounce"
          aria-hidden="true"
        >
          <path
            d="M8 3v10M3 8l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
