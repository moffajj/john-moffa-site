import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import MobileNav from "@/app/components/MobileNav";
import WhatIDo from "@/app/components/WhatIDo";
import About from "@/app/components/About";
import Podcast from "@/app/components/Podcast";
import Experience from "@/app/components/Experience";
import BestFit from "@/app/components/BestFit";
import AIAgents from "@/app/components/AIAgents";
import Tools from "@/app/components/Tools";
import Hobbies from "@/app/components/Hobbies";
import Contact from "@/app/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhatIDo />
        <About />
        <Experience />
        <Tools />
        <BestFit />
        <AIAgents />
        <Podcast />
        <Hobbies />
        <Contact />
      </main>
      <MobileNav />
      <footer
        className="py-8 px-8"
        style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div
          className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          style={{ color: "var(--muted)" }}
        >
          <span>© {new Date().getFullYear()} John Moffa</span>
          <span>Customer Operations &amp; Solutions Leader · New York</span>
        </div>
      </footer>
    </>
  );
}
