"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center px-6 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 65%)",
          transform: "translate(30%, -20%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 65%)",
          transform: "translate(-30%, 20%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full py-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* LEFT — Text */}
        <div>
          {/* Status badge */}
          <div className="fade-up d1 inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 text-sm font-medium"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--head)" }}
          >
            <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            Available for new opportunities
          </div>

          <h1
            className="fade-up d2 font-bold leading-[1.05] tracking-tight mb-6"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
          >
            Hi, I&apos;m{" "}
            <span
              style={{
                background: "var(--grad)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              John Moffa.
            </span>
            <br />
            I run customer ops.
          </h1>

          <p className="fade-up d3 text-lg leading-relaxed mb-4 max-w-lg" style={{ color: "var(--body)" }}>
            15+ years helping SaaS companies turn customer complexity into operational clarity — across onboarding, implementation, support, and go-to-market.
          </p>

          <p className="fade-up d3 text-sm mb-10" style={{ color: "var(--muted)" }}>
            Formerly at <span style={{ color: "var(--body)" }}>Roam</span> &nbsp;·&nbsp; Previously{" "}
            <span style={{ color: "var(--body)" }}>Head of IT Ops at Yext</span>
          </p>

          <div className="fade-up d4 flex flex-col sm:flex-row gap-3 mb-12">
            <a
              href="#experience"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "var(--grad)" }}
            >
              View Experience
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--head)" }}
            >
              Let&apos;s Talk
            </a>
          </div>

          {/* Quick stats */}
          <div className="fade-up d5 grid grid-cols-3 gap-4">
            {[
              { val: "15+", label: "Years in tech" },
              { val: "Full", label: "Customer lifecycle" },
              { val: "GTM→", label: "Support to product" },
            ].map((s) => (
              <div
                key={s.val}
                className="rounded-xl px-4 py-4"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="text-2xl font-bold mb-0.5" style={{ color: "var(--head)" }}>{s.val}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Headshot */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative float">
            {/* Gradient ring */}
            <div
              className="absolute -inset-[3px] rounded-3xl"
              style={{ background: "var(--grad)", opacity: 0.7 }}
            />
            {/* Photo */}
            <div className="relative rounded-3xl overflow-hidden w-[340px] h-[400px]">
              <Image
                src="/headshot.jpg"
                alt="John Moffa"
                fill
                className="object-cover object-top"
                priority
              />
              {/* Bottom gradient fade to dark */}
              <div
                className="absolute inset-x-0 bottom-0 h-32"
                style={{
                  background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)",
                }}
              />
            </div>

            {/* Floating badge: Roam */}
            <div
              className="absolute -bottom-4 -left-6 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--head)" }}
            >
              🚀 Formerly at Roam
            </div>

            {/* Floating badge: NY */}
            <div
              className="absolute -top-4 -right-6 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--head)" }}
            >
              📍 New York
            </div>
          </div>
        </div>
      </div>

      {/* Mobile headshot */}
      <div className="lg:hidden flex justify-center mb-8 -mt-8">
        <div className="relative">
          <div className="absolute -inset-[3px] rounded-full" style={{ background: "var(--grad)", opacity: 0.7 }} />
          <div className="relative w-28 h-28 rounded-full overflow-hidden">
            <Image src="/headshot.jpg" alt="John Moffa" fill className="object-cover object-top" priority />
          </div>
        </div>
      </div>
    </section>
  );
}
