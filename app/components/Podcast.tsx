"use client";

import Image from "next/image";

export default function Podcast() {
  return (
    <section id="podcast" className="py-24 px-6" style={{ background: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue)" }}>
            <span className="w-6 h-px" style={{ background: "var(--blue)" }} />
            Podcast
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: "var(--head)" }}>
            Makes Remote Work
          </h2>
        </div>

        <a
          href="https://www.youtube.com/watch?v=uR1PtTcLJRM&list=PLEt5wUKzPMJHWG6V_1YgGx3wpuA4iFThm"
          target="_blank"
          rel="noopener noreferrer"
          className="group grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video md:aspect-auto overflow-hidden">
            <Image
              src={`https://img.youtube.com/vi/uR1PtTcLJRM/maxresdefault.jpg`}
              alt="Makes Remote Work podcast"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,0,0,0.85)", boxShadow: "0 0 30px rgba(255,0,0,0.4)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="p-8 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ background: "rgba(255,0,0,0.12)", color: "#f87171", border: "1px solid rgba(255,0,0,0.2)" }}
              >
                YouTube Series
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--head)" }}>
              Makes Remote Work
            </h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--body)" }}>
              A podcast and video series produced at Roam exploring what it actually takes to make remote work — well, work. Conversations with operators, leaders, and teams navigating distributed work in the real world.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://ro.am/makesremotework/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}
              >
                🌐 Website
              </a>
              <div
                className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                style={{ color: "var(--blue)" }}
              >
                Watch on YouTube
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <a
                href="https://open.spotify.com/show/4pVFhhByhjraeeDSiXGzKo"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(30,215,96,0.12)", color: "#1DB954", border: "1px solid rgba(30,215,96,0.25)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Spotify
              </a>
              <a
                href="https://podcasts.apple.com/us/podcast/makes-remote-work/id1874491420"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full transition-all hover:opacity-80"
                style={{ background: "rgba(250,0,100,0.1)", color: "#fc3c44", border: "1px solid rgba(250,0,100,0.2)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.003 0C5.374 0 0 5.373 0 12.003c0 6.628 5.374 12.002 12.003 12.002 6.628 0 12.002-5.374 12.002-12.002C24.005 5.373 18.63 0 12.003 0zm0 2.155c5.43 0 9.848 4.418 9.848 9.848 0 5.43-4.417 9.848-9.848 9.848-5.43 0-9.848-4.418-9.848-9.848 0-5.43 4.418-9.848 9.848-9.848zm0 2.617c-2.587 0-4.94 1.038-6.664 2.72a7.659 7.659 0 00-.9 1.115c-.23.354-.09.827.316.978.359.134.756-.051.956-.384.17-.277.374-.535.598-.773 1.398-1.46 3.352-2.372 5.52-2.403h.174c2.169.03 4.122.944 5.52 2.403.224.238.428.496.598.773.2.333.598.518.956.384.406-.15.547-.624.316-.978a7.659 7.659 0 00-.9-1.115C16.806 5.81 14.453 4.772 11.866 4.772h.137zm.137 3.095c-1.47 0-2.805.598-3.774 1.567a5.326 5.326 0 00-.777 1.014c-.23.401-.06.91.37 1.084.394.158.837-.048 1.036-.43.148-.282.334-.54.557-.77a3.626 3.626 0 012.588-1.072 3.626 3.626 0 012.588 1.072c.223.23.409.488.557.77.2.382.642.588 1.036.43.43-.174.6-.683.37-1.084a5.326 5.326 0 00-.777-1.014 5.37 5.37 0 00-3.774-1.567zm0 3.095a2.156 2.156 0 00-2.155 2.155c0 .836.478 1.56 1.178 1.92v3.695c0 .54.438.977.977.977.54 0 .977-.437.977-.977v-3.696a2.152 2.152 0 001.178-1.919 2.156 2.156 0 00-2.155-2.155z"/>
                </svg>
                Apple Podcasts
              </a>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
