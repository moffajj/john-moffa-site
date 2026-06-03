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
  "Adoption Strategy",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div
      className="py-5 overflow-hidden border-y"
      style={{ borderColor: "var(--border)", background: "var(--bg-2)" }}
    >
      <div className="marquee-track select-none">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-4 px-6">
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap" style={{ color: "var(--body)" }}>
              {item}
            </span>
            <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--blue)" }} />
          </span>
        ))}
      </div>
    </div>
  );
}
