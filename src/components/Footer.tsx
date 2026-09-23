export default function Footer() {
  return (
    <footer className="bg-ink pb-36 pt-16 text-white/60 md:pt-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-violet">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="6" r="2.4" fill="white" stroke="none" />
                  <circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                  <circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                  <path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" />
                </svg>
              </span>
              <span className="leading-none">
                <span className="block text-[16px] font-extrabold tracking-tight text-white">Synapse</span>
                <span className="block font-display text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">Judgement</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed">
              An investment council of six agents. Pick your analysts — the Judge handles the rest.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[11px] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              v2.4 · Synapse-6 models
            </p>
          </div>

          {[
            {
              title: "Product",
              links: [
                ["Agent shop", "#agents"],
                ["How synthesis works", "#synthesis"],
                ["Verdict dashboard", "#result"],
                ["Pricing", "#pricing"],
              ],
            },
            {
              title: "Company",
              links: [
                ["Back to top", "#top"],
                ["FAQ", "#faq"],
                ["Team", "mailto:team@synapse.jdg"],
                ["Press", "mailto:press@synapse.jdg"],
              ],
            },
            {
              title: "Legal",
              links: [
                ["Disclaimer", "#faq"],
                ["Terms of service", "#faq"],
                ["Privacy", "#faq"],
                ["API license", "mailto:api@synapse.jdg"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-[14px] text-white/60 transition-colors duration-300 hover:text-white">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 font-mono text-[11.5px] text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Synapse Judgement. All verdicts are analytics, not investment advice.</p>
          <p>10,400+ sources · 6 agents · 1 verdict</p>
        </div>
      </div>
    </footer>
  );
}
