"use client";

import { useReveal } from "@/app/hooks/useReveal";

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
          className="reveal d1 font-bold tracking-tight mb-8 mx-auto"
          style={{
            color: "var(--head)",
            fontSize: "clamp(3rem, 8vw, 7rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            maxWidth: "16ch",
          }}
        >
          Let&apos;s talk.
        </h2>
        <p
          className="reveal d2 text-xl mb-14 mx-auto max-w-lg"
          style={{ color: "var(--body)", lineHeight: 1.7 }}
        >
          Hiring for a senior SaaS operator or customer operations role? Need help cleaning up onboarding or support ops? Let&apos;s connect.
        </p>

        <div className="reveal d3 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:moffajj@gmail.com"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-semibold transition-all duration-200 hover:opacity-90"
            style={{ background: "var(--blue)", color: "#fff" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            moffajj@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/moffajj/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-white hover:text-black"
            style={{ border: "1px solid var(--border)", color: "var(--head)" }}
          >
            LinkedIn →
          </a>
        </div>
      </div>
    </section>
  );
}
