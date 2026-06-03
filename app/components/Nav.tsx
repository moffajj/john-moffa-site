export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <nav className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-slate-900 text-sm tracking-tight">
          John Moffa
        </span>
        <div className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <a href="#what-i-do" className="hover:text-slate-900 transition-colors">
            Expertise
          </a>
          <a href="#experience" className="hover:text-slate-900 transition-colors">
            Experience
          </a>
          <a href="#consulting" className="hover:text-slate-900 transition-colors">
            Consulting
          </a>
          <a
            href="#contact"
            className="px-4 py-1.5 rounded-md bg-[#1e3a5f] text-white font-medium hover:bg-[#16304f] transition-colors"
          >
            Contact
          </a>
        </div>
        {/* Mobile contact link */}
        <a
          href="#contact"
          className="sm:hidden px-4 py-1.5 rounded-md bg-[#1e3a5f] text-white font-medium text-sm"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
