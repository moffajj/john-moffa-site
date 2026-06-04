"use client";

import Image from "next/image";
import { useReveal } from "@/app/hooks/useReveal";

const links = [
  {
    label: "Watch on YouTube",
    href: "https://www.youtube.com/watch?v=uR1PtTcLJRM&list=PLEt5wUKzPMJHWG6V_1YgGx3wpuA4iFThm",
    color: "#ff0000",
    bg: "rgba(255,0,0,0.1)",
    border: "rgba(255,0,0,0.2)",
  },
  {
    label: "Listen on Spotify",
    href: "https://open.spotify.com/show/4pVFhhByhjraeeDSiXGzKo",
    color: "#1DB954",
    bg: "rgba(30,215,96,0.1)",
    border: "rgba(30,215,96,0.2)",
  },
  {
    label: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/makes-remote-work/id1874491420",
    color: "#fc3c44",
    bg: "rgba(252,60,68,0.1)",
    border: "rgba(252,60,68,0.2)",
  },
  {
    label: "Website",
    href: "https://ro.am/makesremotework/",
    color: "var(--blue-2)",
    bg: "rgba(0,113,227,0.1)",
    border: "rgba(0,113,227,0.2)",
  },
];

export default function Podcast() {
  const ref = useReveal();

  return (
    <section
      id="podcast"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8 overflow-hidden"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-16">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Podcast
          </p>
          <h2
            className="font-bold tracking-tight"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Makes Remote Work
          </h2>
        </div>

        {/* Main card */}
        <div
          className="reveal-scale group relative rounded-3xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="grid lg:grid-cols-2 min-h-[400px]">
            {/* Thumbnail */}
            <div className="relative min-h-[280px] lg:min-h-0 overflow-hidden">
              <Image
                src="https://img.youtube.com/vi/uR1PtTcLJRM/maxresdefault.jpg"
                alt="Makes Remote Work"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a
                  href="https://www.youtube.com/watch?v=uR1PtTcLJRM&list=PLEt5wUKzPMJHWG6V_1YgGx3wpuA4iFThm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-18 h-18 flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    width: 72,
                    height: 72,
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="#000" aria-hidden="true">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Text */}
            <div className="p-10 lg:p-14 flex flex-col justify-center" style={{ background: "var(--card)" }}>
              <h3
                className="text-3xl font-bold mb-4"
                style={{ color: "var(--head)", letterSpacing: "-0.02em" }}
              >
                Makes Remote Work
              </h3>
              <p className="text-base leading-relaxed mb-8" style={{ color: "var(--body)" }}>
                A podcast and video series produced at Roam. Real conversations with operators and leaders navigating distributed work — what&apos;s working, what&apos;s not, and what it actually takes.
              </p>
              <div className="flex flex-wrap gap-3">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-80 hover:scale-105"
                    style={{
                      background: l.bg,
                      color: l.color,
                      border: `1px solid ${l.border}`,
                    }}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
