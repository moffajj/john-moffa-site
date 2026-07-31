"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { useReveal } from "@/app/hooks/useReveal";
import {
  siGoogle, siOkta, siJira, siZendesk, siZoom,
  siGodaddy, siGithub, siHubspot, siLoom, siCalendly,
  siFigma, siObsstudio, siZapier, siAnthropic,
} from "simple-icons";

type SimpleIconData = { hex: string; path: string; title: string };

// Cap colors for dark backgrounds: darks → light, lights → muted
function iconColor(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.15) return "#aaa";  // too dark for dark bg
  if (lum > 0.72) return "#aaa";  // too bright / white
  return `#${hex}`;
}

function SIIcon({ icon, size = 20 }: { icon: SimpleIconData; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={iconColor(icon.hex)}
      aria-label={icon.title}
      style={{ flexShrink: 0 }}
    >
      <path d={icon.path} />
    </svg>
  );
}

function Monogram({ text, color = "#c9a84c" }: { text: string; color?: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      border: `1px solid ${color}`,
      borderRadius: 4,
      fontSize: 9,
      fontWeight: 700,
      color,
      flexShrink: 0,
      letterSpacing: "0.02em",
    }}>
      {text}
    </span>
  );
}

function FaviconIcon({ url, mono, monoColor }: { url: string; mono: string; monoColor?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Monogram text={mono} color={monoColor} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={mono}
      height={20}
      style={{ height: 28, width: "auto", objectFit: "contain", flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}

type Tool =
  | { name: string; si: SimpleIconData }
  | { name: string; mono: string; monoColor?: string }
  | { name: string; favicon: string; mono: string; monoColor?: string };

const categories: { label: string; tools: Tool[] }[] = [
  {
    label: "IT / Administrative",
    tools: [
      { name: "Google Workspace", si: siGoogle },
      { name: "Microsoft 365",    favicon: "/tools/microsoft365.webp", mono: "M365" },
      { name: "Okta",             si: siOkta },
      { name: "Rippling",         favicon: "/tools/rippling.png",  mono: "Ri" },
      { name: "Jira",             si: siJira },
      { name: "Zendesk",          si: siZendesk },
      { name: "Zoom",             si: siZoom },
      { name: "Slack",            favicon: "/tools/slack.png",     mono: "Sl" },
      { name: "JAMF",             favicon: "https://www.jamf.com/favicon.ico",      mono: "Ja" },
      { name: "Roam",             favicon: "https://ro.am/favicon.ico",             mono: "Ro" },
      { name: "GoDaddy",          si: siGodaddy },
      { name: "Dialpad",          favicon: "https://www.dialpad.com/favicon.ico",   mono: "Dp" },
      { name: "GitHub",           si: siGithub },
    ],
  },
  {
    label: "Customer Operations",
    tools: [
      { name: "HubSpot",    si: siHubspot },
      { name: "Salesforce", favicon: "/tools/salesforce.svg", mono: "SF" },
      { name: "Loom",       si: siLoom },
      { name: "Calendly",   si: siCalendly },
      { name: "Monday.com", favicon: "/tools/monday.svg", mono: "Mo" },
    ],
  },
  {
    label: "Media / AV",
    tools: [
      { name: "Photoshop",   mono: "Ps", monoColor: "#31A8FF" },
      { name: "Premiere Pro",mono: "Pr", monoColor: "#9999FF" },
      { name: "Figma",       si: siFigma },
      { name: "Riverside",   favicon: "/tools/riverside.webp", mono: "Rv" },
      { name: "OBS",         favicon: "https://obsproject.com/favicon.ico",        mono: "OB" },
      { name: "Zoom Rooms",  si: siZoom },
      { name: "Crestron",    favicon: "/tools/crestron.png",  mono: "Cr" },
    ],
  },
  {
    label: "AI & Automation",
    tools: [
      { name: "Claude",       favicon: "/tools/claude.svg",   mono: "Cl" },
      { name: "ChatGPT",      favicon: "/tools/chatgpt.webp", mono: "GPT" },
      { name: "Claude Code",  favicon: "/tools/claude-code.png", mono: "CC" },
      { name: "Zapier",       si: siZapier },
    ],
  },
];

export default function Tools() {
  const ref = useReveal();

  return (
    <section
      id="tools"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-40 px-8"
      style={{
        background: "var(--bg-1)",
        backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.04) 0%, transparent 60%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="reveal mb-16 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Experience with
          </p>
          <h2
            style={{ color: "var(--head)", fontSize: 48, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            Tools &amp; Systems
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--body)" }}>
            Products and platforms I&apos;ve worked with across my career.
          </p>
        </div>

        {/* Categories */}
        <div className="reveal d1 flex flex-col" style={{ gap: 48 }}>
          {categories.map((cat, ci) => (
            <div key={cat.label}>
              {ci > 0 && (
                <div style={{ height: 1, background: "#1e1e1e", marginBottom: 48 }} />
              )}
              <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "2px", color: "#c9a84c", marginBottom: 20, fontWeight: 500 }}>
                {cat.label}
              </p>
              <m.div
                className="flex flex-wrap"
                style={{ gap: 10 }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true, margin: "-80px" }}
              >
                {cat.tools.map((tool) => (
                  <m.div
                    key={`${cat.label}-${tool.name}`}
                    className="tool-chip"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      height: 52,
                      background: "#0f0f0f",
                      border: "1px solid #222",
                      borderRadius: 12,
                      paddingLeft: 20,
                      paddingRight: 20,
                      cursor: "default",
                    }}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
                  >
                    {"si" in tool
                      ? <SIIcon icon={tool.si} size={28} />
                      : "favicon" in tool
                        ? <FaviconIcon url={tool.favicon} mono={tool.mono} monoColor={tool.monoColor} />
                        : <Monogram text={tool.mono} color={tool.monoColor} />
                    }
                    <span className="tool-chip-text" style={{ fontSize: 14, color: "#ccc", fontWeight: 500 }}>
                      {tool.name}
                    </span>
                  </m.div>
                ))}
              </m.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
