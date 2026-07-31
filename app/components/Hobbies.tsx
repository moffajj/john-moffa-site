"use client";

import { useReveal } from "@/app/hooks/useReveal";

const interests = [
  {
    emoji: "❤️",
    title: "Family",
    body: "Long Island born and raised. Married my high school sweetheart and never looked back. Big Italian family, loud, close, and always around a table. My nephews and niece are everything. They're the best part of any weekend.",
  },
  {
    emoji: "🏆",
    title: "Sports",
    body: "Sports has been a constant since I was a kid and taught me more life lessons than I can count. Yankees. Knicks. Rangers. And yes, the San Francisco 49ers. Random for a Long Island guy, I know. 80s baby. Go Niners.",
  },
  {
    emoji: "🎵",
    title: "Music",
    body: "Open to anything with a good beat but Classic Rock, EDM, and Hip Hop are home base. Italian music while cooking is non-negotiable.",
  },
  {
    emoji: "✈️",
    title: "Travel",
    body: "Always down to explore somewhere new, whether it's a different country or a weekend road trip a few hours away. New places, new people, new perspective. Sometimes that's all you need.",
  },
  {
    emoji: "🍝",
    title: "Food & Cooking",
    body: "New York makes it easy to eat well and I take full advantage of that. But honestly, cooking at home is where it's at for me. There's something therapeutic about it. Italian music on, glass of wine, and I'm in my element. Baking? Not so much.",
  },
  {
    emoji: "🎮",
    title: "Gaming",
    body: "Love a good gaming session to unwind and unplug. Great way to switch the brain off after a long week. #TeamXbox",
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
            style={{ color: "var(--head)", fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6vw, 5rem)", letterSpacing: "0.03em", lineHeight: 0.9, textTransform: "uppercase" }}
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
