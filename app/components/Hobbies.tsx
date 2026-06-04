"use client";

import { useReveal } from "@/app/hooks/useReveal";

const interests = [
  {
    emoji: "🎵",
    title: "Music",
    body: "Music has always been a constant. Good playlist, good headphones — any day gets better.",
  },
  {
    emoji: "🍕",
    title: "Food & Cooking",
    body: "New York makes it easy to eat well. I take full advantage of that. Cooking at home is the reset button.",
  },
  {
    emoji: "✈️",
    title: "Travel",
    body: "New places, new context. Traveling resets the way I think — and I'm always looking for the next trip.",
  },
  {
    emoji: "⚽",
    title: "Sports",
    body: "Big sports fan. Always watching, occasionally playing. It's competitive, which suits me fine.",
  },
  {
    emoji: "💻",
    title: "Tech & Gadgets",
    body: "I work in tech and genuinely love it. New tools, new products — I'm always tinkering with something.",
  },
  {
    emoji: "🎙️",
    title: "Podcasting",
    body: "Running Makes Remote Work taught me that a good conversation is its own kind of craft. Still learning.",
  },
];

export default function Hobbies() {
  const ref = useReveal();

  return (
    <section
      id="hobbies"
      ref={ref as React.RefObject<HTMLElement>}
      className="py-32 px-8"
      style={{ background: "var(--bg-1)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="reveal mb-20">
          <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "var(--blue-2)" }}>
            Outside of work
          </p>
          <h2
            className="font-bold tracking-tight max-w-xl"
            style={{ color: "var(--head)", fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
          >
            Life beyond the laptop
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: "var(--border)" }}>
          {interests.map((item, i) => (
            <div
              key={item.title}
              className={`reveal d${Math.min(i + 1, 5)} group p-10 transition-colors duration-300 hover:bg-white/[0.04]`}
              style={{ background: "var(--bg-1)" }}
            >
              <div className="text-4xl mb-6">{item.emoji}</div>
              <h3
                className="text-xl font-bold mb-3 group-hover:text-white transition-colors"
                style={{ color: "var(--head)", letterSpacing: "-0.01em" }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--body)" }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
