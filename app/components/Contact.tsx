export default function Contact() {
  return (
    <section id="contact" className="bg-[#1e3a5f] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="inline-block text-xs font-semibold tracking-widest text-blue-300 uppercase mb-3">
            Get in touch
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Let&apos;s talk
          </h2>
        </div>

        <p className="text-blue-100 text-base leading-relaxed max-w-2xl mb-10">
          If you&apos;re hiring for a senior SaaS operator, customer operations
          leader, solutions role, or need help cleaning up customer-facing
          operations, I&apos;d be happy to connect.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:moffajj@gmail.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white text-slate-900 font-medium text-sm hover:bg-blue-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-blue-400 text-white font-medium text-sm hover:bg-white/10 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
