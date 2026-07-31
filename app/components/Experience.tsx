"use client";

import Image from "next/image";
import { useState } from "react";
import { m } from "framer-motion";
import { useReveal } from "@/app/hooks/useReveal";

const jobs = [
  {
    role: "Senior Director of Customer Operations & Solutions",
    company: "Roam",
    logo: "/logo-roam.png",
    monogram: "",
    invertLogo: false,
    period: "2023 – 2026",
    type: "SaaS · Virtual Office Platform",
    description:
      "Led cross-functional customer operations, enterprise onboarding, technical implementation, and go-to-market for a high-growth remote collaboration platform. Worked the full customer lifecycle: demos, onboarding, rollout, support, adoption, collaborating daily with Sales, Product, Engineering, and Marketing.",
    tags: [
      "Enterprise onboarding",
      "Customer lifecycle management",
      "Technical support & escalation",
      "Pre-sales consulting",
      "Product feedback loops",
      "Remote workplace ops",
      "Process optimization",
      "Customer enablement",
      "GTM coordination",
    ],
    roles: ["Senior Director of Customer Operations & Solutions"],
    highlights: [
      "Helped scale Roam from pre-revenue to $3M+ ARR, growing the customer base to 1,000+ companies and 30,000+ users while maintaining nearly 70% retention",
      "Served as a permanent point of contact across all customer support escalations, automatically added to every support chat from day one through the full lifecycle",
      "Owned the post-sales customer journey end to end, covering onboarding, implementation, rollout, adoption, and long-term success",
      "Acted as the connective tissue between customers, product, engineering, sales, and executive leadership on a daily basis",
      "Hosted the Makes Remote Work podcast, interviewing CEOs and Founders on distributed team strategy and remote operations",
    ],
    about: "Roam is a virtual office platform built for remote and hybrid teams. Founded by Howard Lerman, it reimagines how distributed teams collaborate by creating persistent, spatial workspaces that replicate the energy of a physical office. Roam is backed by prominent investors and used by companies across tech, media, and professional services.",
  },
  {
    role: "IT Operations & Project Leadership",
    company: "Yext",
    logo: "/logo-yext.png",
    monogram: "",
    invertLogo: false,
    period: "2015 – 2023",
    type: "Enterprise SaaS",
    description:
      "Grew from IT Support Engineer to Head of IT Operations over 7+ years. Built and scaled internal IT infrastructure, led projects across systems, stakeholder management, and operational execution.",
    tags: ["Head of IT Operations", "Principal IT PM", "Senior IT PM", "IT Support Engineer"],
    roles: ["Head of IT Operations", "Principal IT PM", "Senior IT PM", "IT Support Engineer"],
    highlights: [
      "Joined Yext pre-IPO and helped implement critical IT initiatives needed before the company went public on the NYSE in 2017, growing from IT Support Engineer to Head of IT Operations over 7+ years",
      "Managed a 16-person global IT operations team across multiple time zones",
      "Owned IT budget including procurement and lifecycle management of enterprise software (Zoom, Slack, and others) and hardware (laptops, peripherals, AV equipment) across the organization",
      "Led IT buildout for 6 global office openings (NYC, SF, Miami, London, Tokyo, DC) including Yext's 9-story NYC headquarters with a 70-person LED theater",
      "Won a top performer award in 2016 for outstanding contributions to the business",
      "Architected and delivered an Okta Workflows integration with Workday to fully automate employee onboarding and offboarding, reducing manual IT overhead significantly",
      "Led full company migration from Zendesk to Jira Service Desk, rebuilding workflows for IT Operations and multiple other business functions from scratch",
    ],
    about: "Yext is an enterprise SaaS company that helps businesses manage their digital presence across search engines, maps, and directories. Founded by Howard Lerman in 2006, Yext went public on the NYSE in 2017 and serves thousands of enterprise customers globally including major brands in retail, healthcare, and financial services.",
  },
  {
    role: "IT Operations",
    company: "Kimco Realty Corp",
    logo: "/logo-kimco.png",
    monogram: "",
    invertLogo: true,
    period: "2009 – 2015",
    type: "Commercial Real Estate",
    description:
      "Managed IT infrastructure and operations for a leading commercial real estate investment trust, supporting internal systems, end-user support, and technology projects across a large distributed organization.",
    tags: [],
    roles: ["Application Support Analyst", "Project Lead/Analyst", "CAM Disputes Administrator"],
    highlights: [
      "Led end-to-end modernization of a critical internal business process, replacing a paper and spreadsheet-based system with a fully integrated digital platform",
      "Worked directly with developers to architect and design the new system from the ground up, bridging the gap between technical teams and business stakeholders",
      "Traveled nationwide to train employees across all locations on the new platform, managing change management and adoption from launch through rollout",
    ],
    about: "Kimco Realty is one of North America's largest publicly traded owners and operators of open-air, grocery-anchored shopping centers. Listed on the NYSE, Kimco manages hundreds of properties across the United States and is a constituent of the S&P 500.",
  },
  {
    role: "Founder",
    company: "Imagine Events",
    logo: "/logo-imagine.jpg",
    monogram: "",
    invertLogo: false,
    period: "2009 – 2018",
    type: "Event Planning",
    description:
      "Built and operated a business with full ownership across operations, customer relationships, technology, and execution.",
    tags: [],
    roles: ["Founder"],
    highlights: [
      "Founded and operated a full-service event planning company as a side hustle for nearly a decade",
      "Managed AV, production, logistics, and client relationships for live events across New York",
    ],
    about: "Imagine Events was a New York-based event planning and production company specializing in corporate and private events. The company handled end-to-end event execution including venue sourcing, AV production, logistics, and on-site management.",
  },
];

const TAG_STYLE: React.CSSProperties = {
  background: "transparent",
  color: "#c9a84c",
  border: "1px solid rgba(201,168,76,0.45)",
  fontSize: "12px",
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  padding: "3px 10px",
  borderRadius: 999,
  fontWeight: 600,
};

const TRIGGER_BASE: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "1px",
  background: "transparent",
  border: "1px solid #2a2a2a",
  borderRadius: 20,
  padding: "6px 14px",
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
  fontWeight: 500,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

const PANEL_STYLE: React.CSSProperties = {
  background: "#0f0f0f",
  border: "1px solid #1e1e1e",
  borderRadius: 10,
  padding: "20px 24px",
  marginTop: 12,
  overflow: "hidden",
  transition: "max-height 0.3s ease, opacity 0.3s ease",
};

type OpenPanel = "highlights" | "about" | null;

export default function Experience() {
  const ref = useReveal();
  const [openPanels, setOpenPanels] = useState<Record<number, OpenPanel>>({});

  function toggle(jobIndex: number, panel: "highlights" | "about") {
    setOpenPanels((prev) => ({
      ...prev,
      [jobIndex]: prev[jobIndex] === panel ? null : panel,
    }));
  }

  return (
    <section
      id="experience"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-24 px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-10 max-w-xl">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "var(--blue-2)" }}>
            Career
          </p>
          <h2
            style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
          >
            Experience
          </h2>
        </div>

        <m.div
          style={{ borderTop: "1px solid #1e1e1e" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          whileInView="show"
          initial="hidden"
          viewport={{ once: true, margin: "-80px" }}
        >
          {jobs.map((job, i) => {
            const open = openPanels[i] ?? null;
            return (
              <m.div
                key={job.role}
                className={`reveal d${Math.min(i + 1, 5)} group py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 transition-colors duration-300 hover:bg-white/[0.02]`}
                style={{ borderBottom: "1px solid #1e1e1e" }}
                variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
              >
                {/* Left: meta */}
                <div
                  className="lg:col-span-4 flex flex-col self-start"
                  style={{
                    gap: 12,
                    borderLeft: "2px solid #c9a84c",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  {job.company && (
                    <div className="flex items-center" style={{ gap: 10 }}>
                      {job.logo && (
                        <div
                          className="relative shrink-0"
                          style={{ width: "auto", height: 32, minWidth: 32, filter: job.invertLogo ? "brightness(0) invert(1)" : "none" }}
                        >
                          <Image src={job.logo} alt={job.company} height={32} width={80} className="object-contain object-left" style={{ height: 32, width: "auto" }} />
                        </div>
                      )}
                      <div style={{ fontSize: 20, fontWeight: 600, color: "#f0ede8", letterSpacing: "-0.01em" }}>
                        {job.company}
                      </div>
                    </div>
                  )}
                  {job.period && (
                    <div style={{ fontSize: 15, color: "#aaa", fontWeight: 500 }}>{job.period}</div>
                  )}
                  <div style={{ fontSize: 13, color: "#666" }}>· {job.type}</div>
                </div>

                {/* Right: content */}
                <div className="lg:col-span-8">
                  <h3
                    className="mb-3 group-hover:text-white transition-colors"
                    style={{ fontSize: 24, fontWeight: 600, color: "#f0ede8", letterSpacing: "-0.01em" }}
                  >
                    {job.role}
                  </h3>
                  <p className="mb-4" style={{ fontSize: 16, color: "#999", lineHeight: 1.75 }}>
                    {job.description}
                  </p>
                  {/* Subsection triggers */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    {/* Roles — static label */}
                    <span style={{ ...TRIGGER_BASE, cursor: "default", color: "#c9a84c", borderColor: "#c9a84c" }}>
                      Roles
                    </span>

                    {/* Highlights toggle */}
                    <button
                      onClick={() => toggle(i, "highlights")}
                      className="expand-trigger"
                      style={{
                        ...TRIGGER_BASE,
                        borderColor: open === "highlights" ? "#c9a84c" : "#2a2a2a",
                        color: open === "highlights" ? "#c9a84c" : "#666",
                      }}
                    >
                      Highlights
                      <span
                        style={{
                          display: "inline-block",
                          transition: "transform 0.2s",
                          transform: open === "highlights" ? "rotate(180deg)" : "rotate(0deg)",
                          fontSize: 10,
                        }}
                      >
                        ↓
                      </span>
                    </button>

                    {/* About toggle */}
                    <button
                      onClick={() => toggle(i, "about")}
                      className="expand-trigger"
                      style={{
                        ...TRIGGER_BASE,
                        borderColor: open === "about" ? "#c9a84c" : "#2a2a2a",
                        color: open === "about" ? "#c9a84c" : "#666",
                      }}
                    >
                      About {job.company}
                      <span
                        style={{
                          display: "inline-block",
                          transition: "transform 0.2s",
                          transform: open === "about" ? "rotate(180deg)" : "rotate(0deg)",
                          fontSize: 10,
                        }}
                      >
                        ↓
                      </span>
                    </button>
                  </div>

                  {/* Roles — always visible */}
                  <div style={{ marginTop: 10, fontSize: 14, color: "#c9a84c", fontWeight: 500, lineHeight: 1.6 }}>
                    {job.roles.join(" | ")}
                  </div>

                  {/* Highlights panel */}
                  <div
                    style={{
                      ...PANEL_STYLE,
                      maxHeight: open === "highlights" ? "600px" : "0",
                      opacity: open === "highlights" ? 1 : 0,
                      padding: open === "highlights" ? "20px 24px" : "0 24px",
                      border: open === "highlights" ? "1px solid #1e1e1e" : "1px solid transparent",
                    }}
                  >
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {job.highlights.map((item, hi) => (
                        <li key={hi} style={{ display: "flex", gap: 10, fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
                          <span style={{ color: "#c9a84c", flexShrink: 0, marginTop: 1 }}>→</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* About panel */}
                  <div
                    style={{
                      ...PANEL_STYLE,
                      maxHeight: open === "about" ? "400px" : "0",
                      opacity: open === "about" ? 1 : 0,
                      padding: open === "about" ? "20px 24px" : "0 24px",
                      border: open === "about" ? "1px solid #1e1e1e" : "1px solid transparent",
                    }}
                  >
                    <p style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7, margin: 0 }}>
                      {job.about}
                    </p>
                  </div>
                </div>
              </m.div>
            );
          })}
        </m.div>
      </div>
    </section>
  );
}
