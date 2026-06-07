"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

const HeroShape = dynamic(() => import("./HeroShape"), { ssr: false });

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.04) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-8 w-full py-32">
        {/* 3-col on desktop: text | shape | headshot */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_1fr] gap-8 items-center">

          {/* COL 1 — Text */}
          <div>
            <div className="hero-fade hd1 inline-flex items-center gap-2 mb-8">
              <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-sm" style={{ color: "var(--body)" }}>
                Available for new opportunities
              </span>
            </div>

            <h1
              className="hero-fade hd2 font-bold tracking-tight leading-[1.02] mb-6"
              style={{
                color: "var(--head)",
                fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              John<br />Moffa.
            </h1>

            <p
              className="hero-fade hd3 font-medium mb-4 tracking-widest uppercase text-sm"
              style={{ color: "var(--body)" }}
            >
              Customer Operations &amp; Solutions Leader
            </p>

            <p
              className="hero-fade hd4 mb-10 max-w-md"
              style={{ color: "var(--body)", fontSize: "1.05rem", lineHeight: 1.75 }}
            >
              15+ years helping SaaS companies turn customer complexity into operational clarity.
            </p>

            <div className="hero-fade hd5 flex flex-wrap gap-3">
              <a
                href="#work"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-80"
                style={{ background: "#c9a84c", color: "#000" }}
              >
                See my work
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white hover:text-black"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "var(--head)" }}
              >
                Let&apos;s talk
              </a>
            </div>
          </div>

          {/* COL 2 — 3D icosahedron (desktop only) */}
          <div className="hidden lg:flex items-center justify-center" style={{ height: 280 }}>
            <HeroShape />
          </div>

          {/* COL 3 — Headshot */}
          <div className="flex items-center justify-center lg:justify-end">
            <div
              className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden"
              style={{
                border: "1.5px solid rgba(201,168,76,0.5)",
                boxShadow: "0 0 40px rgba(201,168,76,0.08), 0 0 0 6px rgba(201,168,76,0.04)",
              }}
            >
              <Image
                src="/headshot.jpg"
                alt="John Moffa"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
