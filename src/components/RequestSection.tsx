import type { ReactNode } from "react";
import Icon from "./Icon";
import Reveal from "./Reveal";
import { fmtMoney, JUDGE_PRICE, plural } from "../lib/engine";

const QUICK_TICKERS = ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN"];

interface Props {
  ticker: string;
  onTicker: (v: string) => void;
  portfolio: string;
  onPortfolio: (v: string) => void;
  selectedCount: number;
  total: number;
  judgeFree: boolean;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1">
      <label className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-faint">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-faint/80">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export default function RequestSection({
  ticker,
  onTicker,
  portfolio,
  onPortfolio,
  selectedCount,
  total,
  judgeFree,
}: Props) {
  return (
    <section id="request" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-24 md:px-8 lg:py-32">
      <Reveal>
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">01 · Your request</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">What are we judging today?</h2>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
              <Field label="Company ticker">
                <input
                  id="ticker-input"
                  value={ticker}
                  onChange={(e) => onTicker(e.target.value.toUpperCase().replace(/[^A-Z.\-]/g, "").slice(0, 7))}
                  placeholder="AAPL"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full border-b-2 border-line bg-transparent pb-3 pt-2 font-mono text-[30px] font-bold uppercase tracking-[0.06em] text-ink placeholder:font-sans placeholder:text-[24px] placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-faint/70 transition-colors duration-300 focus:border-accent md:text-[36px]"
                />
              </Field>
              <Field label="Portfolio size" hint="optional">
                <input
                  value={portfolio}
                  onChange={(e) => onPortfolio(e.target.value.replace(/[^0-9.]/g, "").slice(0, 9))}
                  placeholder="$100,000"
                  inputMode="decimal"
                  autoComplete="off"
                  className="w-full border-b-2 border-line bg-transparent pb-3 pt-2 font-mono text-[30px] font-bold text-ink placeholder:font-sans placeholder:text-[24px] placeholder:font-medium placeholder:text-faint/70 transition-colors duration-300 focus:border-accent md:text-[36px]"
                />
              </Field>
            </div>

            <p className="mt-5 flex flex-wrap items-center gap-2 text-[13.5px] text-faint">
              <Icon name="bolt" size={15} className="text-amber" />
              Quick start:
              <span className="flex flex-wrap gap-1.5">
                {QUICK_TICKERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => onTicker(t)}
                    className={`rounded-full border px-3 py-1 font-mono text-[12px] font-semibold transition-all duration-300 ${
                      ticker === t
                        ? "border-accent bg-accent text-white"
                        : "border-line bg-white text-sub hover:border-accent hover:text-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </span>
            </p>

            <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-sub">
              Nothing else is required. No account, no questionnaire — the agents get to work the moment
              you press “Run analysis”.
            </p>
          </div>

          <div className="w-full max-w-sm rounded-[24px] border border-line bg-card p-7 shadow-soft transition-all duration-300 hover:shadow-lift">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-faint">Your order</p>
            <dl className="mt-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[14.5px] text-sub">
                  {selectedCount > 0
                    ? `${selectedCount} ${plural(selectedCount, "agent", "agents")}`
                    : "Agents"}
                </dt>
                <dd className="font-mono text-[15px] font-semibold text-ink">{fmtMoney(total)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-[14.5px] text-sub">The Judge</dt>
                <dd
                  className={`font-mono text-[15px] font-semibold transition-colors duration-300 ${
                    judgeFree ? "text-mint" : "text-ink"
                  }`}
                >
                  {judgeFree ? "free" : `+$${JUDGE_PRICE}`}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <span className="text-[15px] font-bold text-ink">Total</span>
              <span key={total} className="anim-fade-up font-mono text-[26px] font-bold text-ink">{fmtMoney(total)}</span>
            </div>
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-faint">
              <Icon name="shield" size={15} className="mt-0.5 shrink-0 text-mint" />
              No account required. No subscription. The price is locked in before you pay.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
