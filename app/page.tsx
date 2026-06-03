import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import WhatIDo from "@/app/components/WhatIDo";
import About from "@/app/components/About";
import Experience from "@/app/components/Experience";
import BestFit from "@/app/components/BestFit";
import Consulting from "@/app/components/Consulting";
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
        <BestFit />
        <Consulting />
        <Contact />
      </main>
      <footer className="bg-[#1e3a5f] border-t border-white/10 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-blue-300">
          <span>© {new Date().getFullYear()} John Moffa</span>
          <span>Customer Operations &amp; Solutions Leader</span>
        </div>
      </footer>
    </>
  );
}
