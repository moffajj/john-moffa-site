export default function Contact() {
  return (
    <section
      id="contact"
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 50%, rgba(37,99,235,0.2) 0%, transparent 60%), #0f172a",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-6">
          <span className="w-6 h-px bg-blue-400" />
          Get in touch
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 max-w-2xl">
          Let&apos;s talk.
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed max-w-xl mb-12">
          If you&apos;re hiring for a senior SaaS operator, customer operations
          leader, or solutions role — or need help cleaning up
          customer-facing operations — I&apos;d be happy to connect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:moffajj@gmail.com"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            moffajj@gmail.com
          </a>
          <a
            href="https://www.linkedin.com/in/moffajj/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg border border-slate-700 text-white font-semibold text-sm hover:border-blue-400 hover:text-blue-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect width="4" height="12" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
