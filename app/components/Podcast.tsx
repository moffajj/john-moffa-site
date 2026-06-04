"use client";

import { useState } from "react";
import { useReveal } from "@/app/hooks/useReveal";

const externalLinks = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/watch?v=uR1PtTcLJRM&list=PLEt5wUKzPMJHWG6V_1YgGx3wpuA4iFThm",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.1)",
    border: "rgba(255,68,68,0.2)",
  },
  {
    label: "Spotify",
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

const tabs = [
  { id: "youtube", label: "▶ Watch on YouTube" },
  { id: "spotify", label: "♫ Listen on Spotify" },
];

export default function Podcast() {
  const ref = useReveal();
  const [activeTab, setActiveTab] = useState("youtube");

  return (
    <section
      id="podcast"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal mb-6">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Podcast
          </p>
          <h2
            className="font-bold tracking-tight mb-4"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Makes Remote Work
          </h2>
          <p className="text-base max-w-xl" style={{ color: "var(--body)", lineHeight: 1.7 }}>
            Real conversations with operators and leaders navigating distributed work — what&apos;s working, what&apos;s not, and what it actually takes.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="reveal mb-6 flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={
                activeTab === tab.id
                  ? { background: "var(--head)", color: "#000" }
                  : { background: "var(--card)", color: "var(--body)", border: "1px solid var(--border)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Embed player */}
        <div
          className="reveal-scale rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {activeTab === "youtube" && (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/videoseries?list=PLEt5wUKzPMJHWG6V_1YgGx3wpuA4iFThm&rel=0&modestbranding=1"
                title="Makes Remote Work — YouTube Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {activeTab === "spotify" && (
            <iframe
              src="https://open.spotify.com/embed/show/4pVFhhByhjraeeDSiXGzKo?utm_source=generator&theme=0"
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Makes Remote Work — Spotify"
            />
          )}
        </div>

        {/* External links */}
        <div className="reveal mt-6 flex flex-wrap gap-3">
          {externalLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 hover:opacity-80"
              style={{ background: l.bg, color: l.color, border: `1px solid ${l.border}` }}
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
