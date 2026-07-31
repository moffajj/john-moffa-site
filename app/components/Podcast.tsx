"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReveal } from "@/app/hooks/useReveal";

interface Episode {
  number: number;
  title: string;
  date: string;
  duration: string;
  description: string;
  link: string;
  thumbnail: string;
}

const externalLinks = [
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
    color: "#b967ff",
    bg: "rgba(185,103,255,0.1)",
    border: "rgba(185,103,255,0.2)",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@roamhq/videos",
    color: "#ff4444",
    bg: "rgba(255,68,68,0.1)",
    border: "rgba(255,68,68,0.2)",
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
  const listRef = useRef<HTMLDivElement>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [coverArt, setCoverArt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    fetch("/api/podcast")
      .then((r) => {
        if (!r.ok) throw new Error("feed error");
        return r.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setEpisodes(data.episodes ?? []);
        setCoverArt(data.coverArt ?? "");
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [episodes]);

  return (
    <section
      id="podcast"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal mb-8 flex flex-col sm:flex-row items-start gap-6">
          {coverArt && (
            <div className="relative w-full aspect-video sm:w-[140px] sm:h-[140px] sm:aspect-auto shrink-0 rounded-xl overflow-hidden">
              <Image src={coverArt} alt="Makes Remote Work" fill className="object-cover" unoptimized />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--blue-2)" }}>
              Podcast
            </p>
            <h2
              style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
            >
              Makes Remote Work
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--body)", lineHeight: 1.6 }}>
              Makes Remote Work is a podcast from Roam that spotlights leaders who are building high performing teams without a traditional office. Each episode is a quick, practical conversation about what actually works in remote and hybrid environments.
            </p>
          </div>
        </div>

        {/* External links */}
        <div className="reveal mb-8 flex flex-wrap gap-3">
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

        {/* Episode list */}
        <div className="reveal-scale relative overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {loading && (
            <div className="flex items-center justify-center py-24" style={{ color: "var(--muted)" }}>
              <span className="text-sm">Loading episodes…</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="text-sm" style={{ color: "var(--muted)" }}>Couldn&apos;t load the episode list right now.</p>
              <a
                href="https://open.spotify.com/show/4pVFhhByhjraeeDSiXGzKo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
                style={{ background: "var(--blue)", color: "#fff" }}
              >
                Listen on Spotify ↗
              </a>
            </div>
          )}

          {!loading && !error && episodes.length > 0 && (
            <>
              {/* Scrollable list */}
              <div
                ref={listRef}
                style={{
                  maxHeight: 600,
                  overflowY: "scroll",
                  background: "var(--bg)",
                }}
              >
                {episodes.map((ep, i) => (
                  <a
                    key={ep.link || i}
                    href={ep.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 px-6 py-5 transition-all duration-200"
                    style={{
                      borderBottom: i < episodes.length - 1 ? "1px solid var(--border)" : "none",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeft = "2px solid rgba(201,168,76,0.7)";
                      (e.currentTarget as HTMLElement).style.paddingLeft = "22px";
                      (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeft = "none";
                      (e.currentTarget as HTMLElement).style.paddingLeft = "24px";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    {/* Episode number */}
                    <span
                      className="shrink-0 text-xs font-mono w-8 text-right"
                      style={{ color: "var(--muted)" }}
                    >
                      {String(ep.number).padStart(2, "0")}
                    </span>

                    {/* Thumbnail */}
                    {ep.thumbnail && (
                      <div className="relative shrink-0 rounded-md overflow-hidden" style={{ width: 44, height: 44 }}>
                        <Image src={ep.thumbnail} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold truncate transition-colors duration-200 group-hover:text-white"
                        style={{ color: "var(--head)" }}
                      >
                        {ep.title.replace(/^E\d+[:\s]+/i, "")}
                      </div>
                      {ep.description && (
                        <div className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
                          {ep.description}
                        </div>
                      )}
                    </div>

                    {/* Meta: date + duration */}
                    <div className="shrink-0 text-right hidden sm:block">
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{ep.date}</div>
                      {ep.duration && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{ep.duration}</div>
                      )}
                    </div>

                    {/* Play icon */}
                    <div
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 group-hover:bg-[#1DB954]"
                      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                    >
                      <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" style={{ color: "var(--body)", marginLeft: 1 }}>
                        <path d="M0 0l10 6-10 6V0z" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>

              {/* Bottom fade when not scrolled to end */}
              {!atBottom && (
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
                  style={{
                    background: "linear-gradient(to bottom, transparent, var(--bg))",
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Episode count */}
        {!loading && !error && episodes.length > 0 && (
          <p className="reveal mt-4 text-xs" style={{ color: "var(--muted)" }}>
            {episodes.length} episodes
          </p>
        )}
      </div>
    </section>
  );
}
