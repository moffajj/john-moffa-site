"use client";

import Image from "next/image";

export default function Contact() {
  return (
    <section
      id="contact"
      className="relative py-28 px-6 overflow-hidden"
      style={{ background: "var(--bg-2)" }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "var(--blue)" }}>
              <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
              Get in touch
            </span>
            <h2
              className="font-bold tracking-tight mb-6 leading-tight"
              style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
            >
              Let&apos;s talk.
            </h2>
            <p className="text-lg leading-relaxed mb-10" style={{ color: "var(--body)" }}>
              Hiring for a senior SaaS operator or customer operations role? Need help cleaning up onboarding or support ops? I&apos;m easy to talk to.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:moffajj@gmail.com"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "var(--grad)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Email me
              </a>
              <a
                href="https://www.linkedin.com/in/moffajj/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--head)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right — photo + card */}
          <div className="hidden lg:flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-[2px] rounded-full opacity-60" style={{ background: "var(--grad)" }} />
              <div className="relative w-36 h-36 rounded-full overflow-hidden">
                <Image src="/headshot.jpg" alt="John Moffa" fill className="object-cover object-top" />
              </div>
            </div>
            <div
              className="w-full rounded-2xl p-6 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="text-lg font-bold mb-1" style={{ color: "var(--head)" }}>John Moffa</div>
              <div className="text-sm mb-4" style={{ color: "var(--body)" }}>Customer Operations & Solutions Leader</div>
              <div className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
                <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
                Available for new opportunities
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
