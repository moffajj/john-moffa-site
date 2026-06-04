"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Full bleed photo — right side, fading into black */}
      <div className="absolute inset-0">
        <div className="absolute right-0 top-0 h-full w-full lg:w-[65%]">
          <Image
            src="/headshot.jpg"
            alt="John Moffa"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Fade left */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, #000 0%, #000 20%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2) 70%, transparent 100%)",
            }}
          />
          {/* Fade bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 30%, transparent 60%)",
            }}
          />
        </div>
        {/* Full overlay on mobile */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: "rgba(0,0,0,0.7)" }}
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-8 pb-20 pt-36 w-full">
        <div className="max-w-2xl">
          {/* Status */}
          <div className="hero-fade hd1 inline-flex items-center gap-2 mb-8">
            <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-sm" style={{ color: "var(--body)" }}>
              Available for new opportunities
            </span>
          </div>

          {/* Name */}
          <h1
            className="hero-fade hd2 font-bold tracking-tight leading-[1] mb-6"
            style={{
              color: "var(--head)",
              fontSize: "clamp(3.5rem, 9vw, 8rem)",
              letterSpacing: "-0.03em",
            }}
          >
            John<br />Moffa.
          </h1>

          {/* Role */}
          <p
            className="hero-fade hd3 font-medium mb-4"
            style={{
              color: "var(--body)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Customer Operations & Solutions Leader
          </p>

          {/* Line */}
          <p
            className="hero-fade hd4 mb-10 max-w-lg"
            style={{ color: "var(--body)", fontSize: "1.1rem", lineHeight: 1.7 }}
          >
            15+ years helping SaaS companies turn customer complexity into operational clarity.
          </p>

          {/* CTAs */}
          <div className="hero-fade hd5 flex flex-wrap gap-3">
            <a
              href="#work"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white hover:text-black"
              style={{ background: "var(--blue)", color: "#fff" }}
            >
              See my work
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white hover:text-black"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "var(--head)" }}
            >
              Let&apos;s talk
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2" style={{ color: "var(--muted)" }}>
        <div
          className="w-px h-16"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--muted))",
          }}
        />
        <span className="text-xs tracking-widest uppercase" style={{ writingMode: "vertical-rl" }}>
          Scroll
        </span>
      </div>
    </section>
  );
}
