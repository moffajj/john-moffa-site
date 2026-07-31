const items = [
  "IT Operations",
  "GTM Strategy",
  "Customer Operations",
  "Technical Support",
  "Product Feedback",
  "Project Management",
  "AV Support",
  "Social Media Content",
  "MBA",
];

export default function Marquee() {
  const doubled = [...items, ...items];
  return (
    <div
      className="py-5 overflow-hidden border-y select-none"
      style={{ borderColor: "var(--border)", background: "var(--bg-1)" }}
    >
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-5 px-5">
            <span
              className="text-xs font-semibold tracking-widest uppercase whitespace-nowrap"
              style={{ color: "var(--muted)", fontSize: 15 }}
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
