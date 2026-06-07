"use client";

import Image from "next/image";
import { useRef } from "react";
import { useReveal } from "@/app/hooks/useReveal";

export default function About() {
  const ref = useReveal();
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rotX = -y * 14;
    const rotY = x * 14;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    // Specular highlight moves opposite to tilt
    glare.style.opacity = "1";
    glare.style.background = `radial-gradient(circle at ${50 - x * 80}% ${50 - y * 80}%, rgba(255,255,255,0.12) 0%, transparent 65%)`;
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    glare.style.opacity = "0";
  };

  return (
    <section
      id="about"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8 overflow-hidden"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        {/* Left — photo with 3D tilt */}
        <div className="reveal-scale relative flex justify-center lg:justify-start">
          <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className="relative aspect-[3/4] w-full max-w-md rounded-2xl overflow-hidden cursor-default"
            style={{
              transition: "transform 0.15s cubic-bezier(0.23,1,0.32,1)",
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src="/headshot.jpg"
              alt="John Moffa"
              fill
              className="object-cover object-top"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
              }}
            />
            {/* Specular highlight overlay */}
            <div
              ref={glareRef}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                opacity: 0,
                transition: "opacity 0.2s ease",
                mixBlendMode: "screen",
              }}
            />
            {/* Caption */}
            <div className="absolute bottom-6 left-6 right-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", color: "var(--head)", border: "1px solid var(--border)" }}
              >
                <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
                Available now
              </div>
            </div>
          </div>
        </div>

        {/* Right — text */}
        <div>
          <p className="reveal text-xs font-bold tracking-widest uppercase mb-6" style={{ color: "var(--blue-2)" }}>
            The story
          </p>
          <h2
            className="reveal d1 font-bold tracking-tight leading-tight mb-10"
            style={{ color: "var(--head)", fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}
          >
            I work in the messy middle.
          </h2>
          <div className="reveal d2 space-y-5 text-base leading-relaxed" style={{ color: "var(--body)" }}>
            <p>
              At Roam, my job was to be the connective tissue between customers, product, engineering, and the business. Onboarding, support, implementation, feedback loops, GTM — it all ran through me. Broad by design.
            </p>
            <p>
              Before that, 10+ years at Yext building IT Operations from the ground up. Started as a support engineer, left as Head of IT Operations. I know what it actually takes to make a company run.
            </p>
            <p>
              I&apos;m at my best when there&apos;s no clean org chart answer. Give me a complex customer problem, a cross-functional mess, or an operational gap — I&apos;ll figure it out.
            </p>
          </div>

          {/* Quick facts */}
          <div className="reveal d3 mt-10 grid grid-cols-2 gap-3">
            {[
              { label: "Based in", val: "New York" },
              { label: "Last role", val: "Roam" },
              { label: "Before that", val: "Yext, 10+ yrs" },
              { label: "Open to", val: "Full-time + Consulting" },
            ].map((f) => (
              <div
                key={f.label}
                className="px-4 py-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>{f.label}</div>
                <div className="text-sm font-semibold" style={{ color: "var(--head)" }}>{f.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
