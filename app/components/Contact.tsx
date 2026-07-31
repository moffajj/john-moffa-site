"use client";

import { siX, siInstagram } from "simple-icons";
import { useReveal } from "@/app/hooks/useReveal";

// LinkedIn SVG path (hardcoded — removed from simple-icons v16 due to trademark)
const LINKEDIN_PATH = "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/moffajj/", path: LINKEDIN_PATH },
  { label: "X", href: "https://x.com/moffajj", path: siX.path },
  { label: "Instagram", href: "https://www.instagram.com/mofstar321/", path: siInstagram.path },
];

export default function Contact() {
  const ref = useReveal();

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-40 px-8 overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Big background text */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none hidden lg:block"
        style={{
          fontSize: "20vw",
          fontWeight: 900,
          color: "rgba(255,255,255,0.015)",
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
        }}
      >
        LET&apos;S TALK
      </div>

      <div className="relative max-w-7xl mx-auto text-center">
        <p className="reveal text-xs font-bold tracking-widest uppercase mb-8" style={{ color: "var(--blue-2)" }}>
          Get in touch
        </p>
        <h2
          className="reveal d1 mb-8 mx-auto"
          style={{
            color: "var(--head)",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(4rem, 9vw, 8rem)",
            letterSpacing: "0.03em",
            lineHeight: 0.9,
            textTransform: "uppercase",
            maxWidth: "16ch",
          }}
        >
          Let&apos;s talk.
        </h2>
        <p
          className="reveal d2 text-xl mb-14 mx-auto max-w-lg"
          style={{ color: "var(--body)", lineHeight: 1.7 }}
        >
          If something here resonates, let&apos;s talk. Whether you&apos;re hiring, collaborating, or just want to swap ideas, my inbox is always open.
        </p>

        {/* Download Resume button */}
        <div className="reveal d3 flex justify-center mb-4">
          <a
            href="/John_Moffa_Resume.pdf"
            download="John_Moffa_Resume.pdf"
            className="resume-btn inline-flex items-center gap-2"
            style={{ height: 48, paddingLeft: 20, paddingRight: 20, fontSize: 15, fontWeight: 500, borderRadius: 30, border: "1px solid #c9a84c", color: "#c9a84c", background: "transparent", textDecoration: "none", transition: "background 0.2s ease, color 0.2s ease" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Resume
          </a>
        </div>

        {/* Email button */}
        <div className="reveal d4 flex justify-center">
          <a
            href="mailto:moffajj@gmail.com"
            className="inline-flex items-center justify-center gap-3 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
            style={{ height: 48, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: "var(--blue)", color: "#fff", borderRadius: 30 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            moffajj@gmail.com
          </a>
        </div>

        {/* Social icons row */}
        <div
          className="reveal d5"
          style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}
        >
          {SOCIALS.map(({ label, href, path }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="social-icon-btn"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d={path} />
              </svg>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .resume-btn:hover {
          background: #c9a84c !important;
          color: #0a0a0a !important;
        }
        .social-icon-btn svg {
          fill: #f0ede8;
          transition: fill 0.2s ease;
        }
        .social-icon-btn:hover svg {
          fill: #c9a84c;
        }
      `}</style>
    </section>
  );
}
