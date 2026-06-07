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
      {/* Subtle background grain/glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 60% 40%, rgba(0,113,227,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-8 w-full py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Text */}
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
                fontSize: "clamp(3rem, 7vw, 6rem)",
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
                style={{ background: "var(--blue)", color: "#fff" }}
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

          {/* RIGHT — Headshot in graphic circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">

              {/* Outer rotating dashed ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "1px dashed rgba(255,255,255,0.1)",
                  animation: "spin 20s linear infinite",
                }}
              />

              {/* Middle ring */}
              <div
                className="absolute inset-4 rounded-full"
                style={{ border: "1px solid rgba(0,113,227,0.2)" }}
              />

              {/* Blue arc accent */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 400 400"
                fill="none"
                aria-hidden="true"
                style={{ animation: "spin 12s linear infinite reverse" }}
              >
                <circle
                  cx="200" cy="200" r="190"
                  stroke="url(#arcGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="120 1070"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0071e3" stopOpacity="0" />
                    <stop offset="50%" stopColor="#0071e3" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Photo circle */}
              <div
                className="absolute inset-8 rounded-full overflow-hidden"
                style={{
                  border: "2px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,113,227,0.1)",
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

              {/* Dot accents on ring */}
              {[0, 90, 180, 270].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "var(--blue)",
                    top: "50%",
                    left: "50%",
                    transform: `rotate(${deg}deg) translateX(186px) translateY(-50%)`,
                    opacity: 0.6,
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Three.js shape — full section canvas, pointer-events none */}
      <HeroShape />

      {/* Spin keyframe inline */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
