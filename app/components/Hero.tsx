"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { m } from "framer-motion";
import Marquee from "@/app/components/Marquee";

const TITLES = [
  "CUSTOMER OPERATIONS LEADER",
  "HEAD OF IT OPERATIONS",
  "SAAS IMPLEMENTATION EXPERT",
  "ENTREPRENEUR",
];

function useTypewriter() {
  const [display, setDisplay] = useState("");
  const [cursor, setCursor] = useState(true);
  const [titleIndex, setTitleIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pausing" | "erasing">("typing");
  const [charIndex, setCharIndex] = useState(0);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const current = TITLES[titleIndex];

    if (phase === "typing") {
      if (charIndex < current.length) {
        const id = setTimeout(() => {
          setDisplay(current.slice(0, charIndex + 1));
          setCharIndex((i) => i + 1);
        }, 70);
        return () => clearTimeout(id);
      } else {
        // Fully typed — pause
        const id = setTimeout(() => setPhase("erasing"), 2000);
        return () => clearTimeout(id);
      }
    }

    if (phase === "erasing") {
      if (charIndex > 0) {
        const id = setTimeout(() => {
          setDisplay(current.slice(0, charIndex - 1));
          setCharIndex((i) => i - 1);
        }, 35);
        return () => clearTimeout(id);
      } else {
        // Fully erased — move to next title
        setTitleIndex((i) => (i + 1) % TITLES.length);
        setPhase("typing");
      }
    }
  }, [phase, charIndex, titleIndex]);

  return { display, cursor: phase === "pausing" ? false : cursor };
}

export default function Hero() {
  const { display, cursor } = useTypewriter();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between overflow-hidden"
      style={{ background: "var(--bg)" }}
    >

      <div className="relative max-w-7xl mx-auto px-8 w-full py-32 flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* COL 1 — Text */}
          <m.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
            initial="hidden"
            animate="show"
          >
            <m.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              style={{ willChange: "transform" }}
            >
              <h1
                className="hero-fade hd2 mb-6"
                style={{
                  color: "var(--head)",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 6.5vw, 6rem)",
                  letterSpacing: "0.03em",
                  lineHeight: 0.9,
                  textTransform: "uppercase",
                }}
              >
                Hi, I&apos;m John.
              </h1>
            </m.div>

            <m.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              style={{ willChange: "transform" }}
            >
              <p
                className="hero-fade hd3 font-medium mb-4 tracking-widest uppercase text-sm"
                style={{ color: "var(--body)", minHeight: "1.5em" }}
              >
                {display}
                <span style={{ color: "#c9a84c", opacity: cursor ? 1 : 0, marginLeft: 1 }}>|</span>
              </p>
            </m.div>

            <m.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              style={{ willChange: "transform" }}
            >
              <p
                className="hero-fade hd4 mb-10 max-w-md"
                style={{ color: "var(--body)", fontSize: "1.05rem", lineHeight: 1.75 }}
              >
                15+ years turning complex operations into systems that actually work.
              </p>
            </m.div>

            <m.div
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
              style={{ willChange: "transform" }}
            >
              <div className="hero-fade hd5 flex flex-wrap gap-3 hero-cta-row">
                <a
                  href="#work"
                  className="inline-flex items-center gap-2 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
                  style={{ height: 48, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: "var(--blue)", color: "#fff", borderRadius: 30 }}
                >
                  See my work
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full transition-all duration-200 hover:bg-white hover:text-black"
                  style={{ height: 48, paddingLeft: 24, paddingRight: 24, fontSize: 15, fontWeight: 500, background: "var(--blue)", color: "#fff", borderRadius: 30 }}
                >
                  Let&apos;s talk
                </a>
              </div>
            </m.div>
          </m.div>

          {/* COL 2 — Headshot */}
          <m.div
            className="flex items-center justify-center lg:justify-end"
            variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.4 } } }}
            initial="hidden"
            animate="show"
            style={{ willChange: "transform" }}
          >
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
          </m.div>

        </div>
      </div>

      <Marquee />
    </section>
  );
}
