const items = [
  "Customer Operations",
  "Enterprise Onboarding",
  "Technical Implementation",
  "GTM Execution",
  "SaaS Operations",
  "IT Operations",
  "Support & Escalation",
  "Product Feedback",
  "Sales Collaboration",
  "Remote Workplace Ops",
  "Rollout Strategy",
  "Cross-Functional Leadership",
  "Customer Enablement",
  "Process Improvement",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div
      className="py-4 overflow-hidden border-y select-none"
      style={{ borderColor: "var(--border)", background: "var(--bg-1)" }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-5">
            <span
              className="text-xs font-semibold tracking-widest uppercase whitespace-nowrap"
              style={{ color: "var(--muted)" }}
            >
              {item}
            </span>
            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--muted)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}
