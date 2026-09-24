import Icon from "./Icon";
import Reveal from "./Reveal";

const GUARANTEES = [
  { title: "Total shown before you pay", text: "The order total is locked in the bottom bar the moment you flip a switch — before the analysis even starts." },
  { title: "Pay per session", text: "No subscriptions, no “renewals”, no default charges. One ticker — one price." },
  { title: "The Judge is $0 with 2+ agents", text: "Synthesis and reasoning are included in the team price. With a single agent, the Judge’s work is $15." },
  { title: "No sign-up before the result", text: "Email and card are only requested after you’ve seen the price and pressed “Run analysis”." },
];

const BARS = [3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 4, 1, 3, 2, 1, 3, 2, 1, 4, 2, 1];

export default function Transparency() {
  return (
    <section id="pricing" className="relative border-t border-line bg-card/60">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-32">
        <div>
          <Reveal>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">05 · Transparency</p>
            <h2 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] md:text-5xl">
              The price is known<br />before launch. Always.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-sub">
              We deliberately never hide the cost behind a “Contact us” button. Flip a switch — and the
              number in your order changes in the same millisecond.
            </p>
          </Reveal>

          <ul className="mt-10 space-y-4">
            {GUARANTEES.map((g, i) => (
              <Reveal key={g.title} delay={i * 90} as="li">
                <div className="group flex gap-4 rounded-[18px] border border-transparent bg-white/0 p-4 transition-all duration-300 hover:border-line hover:bg-white hover:shadow-soft">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f9ef] text-[#1b7a41] transition-transform duration-300 group-hover:scale-110">
                    <Icon name="check" size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-extrabold">{g.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-sub">{g.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        {/* receipt */}
        <Reveal delay={150}>
          <div className="relative mx-auto w-full max-w-[400px] rotate-[1.6deg] transition-transform duration-500 hover:rotate-0">
            <span className="absolute -right-3 -top-5 z-10 rotate-[10deg] rounded-full border-2 border-mint px-3.5 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1b7a41]">
              no hidden charges
            </span>
            <div className="rounded-[20px] border border-line bg-white p-7 font-mono shadow-lift md:p-8">
              <p className="text-center text-[13px] font-bold tracking-[0.18em] text-ink">SYNAPSE JUDGEMENT</p>
              <p className="mt-1 text-center text-[11px] text-faint">order #SN-2481 · NVDA · 14:32 UTC</p>

              <div className="my-5 border-t border-dashed border-line" />

              <dl className="space-y-2.5 text-[13px]">
                {[
                  ["Technical", "$5"],
                  ["Fundamental", "$7"],
                  ["Earning Calls", "$8"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink/85">{k}</dt>
                    <dd className="text-faint">·</dd>
                    <dd className="font-semibold text-ink">{v}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-ink/85">The Judge</dt>
                  <dd className="text-faint">·</dd>
                  <dd className="font-semibold text-[#1b7a41]">
                    $0 <span className="text-[11px] font-normal text-faint line-through">$15</span>
                  </dd>
                </div>
              </dl>

              <div className="my-5 border-t border-dashed border-line" />

              <div className="flex items-baseline justify-between text-[15px]">
                <span className="font-bold text-ink">TOTAL</span>
                <span className="font-bold text-ink">$20</span>
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-faint">
                Charged after you confirm the price. Verdict and reasoning included.
              </p>

              <svg viewBox="0 0 280 34" className="mt-5 h-9 w-full text-ink" preserveAspectRatio="none" aria-hidden="true">
                {(() => {
                  let x = 4;
                  return BARS.map((w, i) => {
                    const el = <rect key={i} x={x} y="0" width={w * 2.1} height="34" fill="currentColor" opacity={0.85} />;
                    x += w * 2.1 + 3.4;
                    return el;
                  });
                })()}
              </svg>
              <p className="mt-2 text-center text-[10px] tracking-[0.3em] text-faint">SNJ·2481·0020·USD</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
