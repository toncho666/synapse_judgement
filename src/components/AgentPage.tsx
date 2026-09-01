import type { ReactNode } from "react";
import Icon from "./Icon";
import Reveal from "./Reveal";
import { CandleChart, DataTable, HBars, Heatmap, SignalChip, VBars } from "./viz";
import {
  AGENT_PAGES, EARN_REPORT, FUND_REPORT, NEWS_REPORT, PORT_REPORT, TECH_REPORT,
} from "../data/agentMock";
import { JUDGE_PRICE, plural, type AgentDef, type AgentId, type Signal } from "../lib/engine";

const idxOf: Record<AgentId, string> = { tech: "01", fund: "02", port: "03", news: "04", earn: "05" };

function sig(kind: string): ReactNode {
  if (kind === "bull" || kind === "bear" || kind === "flat") return <SignalChip kind={kind as Signal} />;
  return <span className="font-mono text-[12.5px] font-semibold text-ink">{kind}</span>;
}
function withChips(rows: (string | number)[][], sigCol: number): ReactNode[][] {
  return rows.map((r) => r.map((c, i) => (i === sigCol ? sig(String(c)) : String(c))));
}

function Card({ caption, children, className = "" }: { caption: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[22px] border border-line bg-card p-6 md:p-7 ${className}`}>
      <p className="mb-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">{caption}</p>
      {children}
    </div>
  );
}

interface Props {
  agent: AgentDef;
  selected: AgentId[];
  onToggle: (id: AgentId) => void;
  goHome: (section?: string) => void;
}

export default function AgentPage({ agent, selected, onToggle, goHome }: Props) {
  const data = AGENT_PAGES[agent.id];
  const inTeam = selected.includes(agent.id);
  const n = selected.length;

  const reportBody = () => {
    switch (agent.id) {
      case "tech":
        return (
          <div className="mt-8 space-y-6">
            <Card caption="Price structure · 44 sessions · daily">
              <CandleChart />
            </Card>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card caption="Indicators">
                <DataTable cols={TECH_REPORT.indicators.cols} rows={withChips(TECH_REPORT.indicators.rows, 3)} />
              </Card>
              <Card caption="Multi-timeframe read">
                <DataTable cols={TECH_REPORT.timeframes.cols} rows={withChips(TECH_REPORT.timeframes.rows, 3)} />
              </Card>
            </div>
            <Card caption="Scenario map">
              <DataTable cols={TECH_REPORT.scenarios.cols} rows={TECH_REPORT.scenarios.rows.map((r) => r.map(String))} />
            </Card>
          </div>
        );
      case "fund":
        return (
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
            <Card caption="Quality score">
              <HBars items={FUND_REPORT.quality} color={agent.color} />
              <p className="mt-5 text-[12.5px] leading-relaxed text-faint">
                Composite of 43 ratios, normalized against the company's own ten-year history.
              </p>
            </Card>
            <div className="space-y-6">
              <Card caption="Quarterly financials">
                <DataTable cols={FUND_REPORT.quarters.cols} rows={FUND_REPORT.quarters.rows.map((r) => r.map(String))} />
              </Card>
              <Card caption="Valuation vs history">
                <DataTable cols={FUND_REPORT.valuation.cols} rows={withChips(FUND_REPORT.valuation.rows, 3)} />
              </Card>
            </div>
          </div>
        );
      case "port":
        return (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card caption="Correlation map · 60-day rolling">
                <Heatmap labels={PORT_REPORT.heatmap.labels} values={PORT_REPORT.heatmap.values} />
              </Card>
              <Card caption="Factor exposures">
                <HBars items={PORT_REPORT.factors} center color={agent.color} />
                <p className="mt-5 text-[12.5px] leading-relaxed text-faint">
                  Decomposition against a five-factor model. Negative value = short exposure.
                </p>
              </Card>
            </div>
            <Card caption="Position sizing & stress tests">
              <DataTable cols={PORT_REPORT.sizing.cols} rows={withChips(PORT_REPORT.sizing.rows, 3)} />
            </Card>
          </div>
        );
      case "news":
        return (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card caption="Mentions volume · last 14 days, K/day">
                <VBars values={NEWS_REPORT.mentions} unit="K" color={agent.color} />
              </Card>
              <Card caption="Source mix">
                <HBars items={NEWS_REPORT.sources} color={agent.color} />
              </Card>
            </div>
            <Card caption="Event timeline · 7 days">
              <ul className="space-y-4">
                {NEWS_REPORT.headlines.map((h, i) => (
                  <li key={i} className="group flex gap-3.5 rounded-[14px] p-2.5 transition-colors duration-300 hover:bg-white">
                    <span
                      className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${
                        h.tone === "bull" ? "bg-mint" : h.tone === "bear" ? "bg-flame" : "bg-faint"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold leading-snug text-ink">{h.text}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-faint">
                        <span className="font-semibold text-sub">{h.src}</span>
                        <span>· {h.t} ago</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            h.impact === "High"
                              ? "bg-[#fdeceb] text-[#b3271e]"
                              : h.impact === "Med"
                                ? "bg-paper text-sub"
                                : "bg-paper text-faint"
                          }`}
                        >
                          {h.impact}
                        </span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        );
      case "earn":
        return (
          <div className="mt-8 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card caption="Transcript highlights · last call">
                <div className="space-y-5">
                  {EARN_REPORT.quotes.map((q, i) => (
                    <blockquote key={i} className="rounded-[14px] border border-line bg-white p-5">
                      <p className="text-[14.5px] leading-relaxed text-ink">
                        “
                        {q.text.map((seg, j) =>
                          seg.hl ? (
                            <mark key={j} className="rounded-[4px] px-1 py-0.5" style={{ backgroundColor: `${agent.color}1f`, color: agent.color }}>
                              {seg.t}
                            </mark>
                          ) : (
                            <span key={j}>{seg.t}</span>
                          ),
                        )}
                        ”
                      </p>
                      <footer className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                        {q.who}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </Card>
              <div className="space-y-6">
                <Card caption="Tone analytics">
                  <HBars items={EARN_REPORT.tone} color={agent.color} />
                </Card>
                <Card caption="Guidance vs consensus">
                  <DataTable cols={EARN_REPORT.guidance.cols} rows={EARN_REPORT.guidance.rows.map((r) => r.map(String))} />
                </Card>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 md:px-8 lg:pt-32">
      {/* breadcrumb */}
      <Reveal>
        <nav className="flex flex-wrap items-center gap-2.5 font-mono text-[12px] text-faint">
          <a href="#/" className="transition-colors hover:text-ink">Synapse Judgement</a>
          <span>/</span>
          <button onClick={() => goHome("agents")} className="transition-colors hover:text-ink">Agents</button>
          <span>/</span>
          <span className="font-semibold text-ink">{agent.name}</span>
        </nav>
      </Reveal>

      {/* hero band */}
      <Reveal delay={80}>
        <div
          className="relative mt-8 overflow-hidden rounded-[32px] border border-line p-8 md:p-12"
          style={{ background: `linear-gradient(135deg, ${agent.color}17, ${agent.color}04 60%, transparent)` }}
        >
          <span
            className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[180px] font-bold leading-none opacity-[0.07] md:text-[260px]"
            style={{ color: agent.color }}
            aria-hidden="true"
          >
            {idxOf[agent.id]}
          </span>

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="flex h-16 w-16 items-center justify-center rounded-[20px] text-white shadow-lift"
                  style={{ backgroundColor: agent.color }}
                >
                  <Icon name={agent.id} size={32} />
                </span>
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>
                    Agent {idxOf[agent.id]} · {agent.speed} per run
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink md:text-[42px] md:leading-[1.05]">
                    {agent.name}
                  </h1>
                </div>
              </div>
              <p className="mt-5 text-[16.5px] leading-relaxed text-sub">{data.tagline}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.tags.map((t) => (
                  <span key={t} className="rounded-full border border-line bg-white/80 px-3 py-1.5 font-mono text-[11.5px] font-semibold text-sub">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
              <p className="font-mono text-[30px] font-bold text-ink">
                ${agent.price}
                <span className="text-[13px] font-medium text-faint"> / analysis</span>
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => !inTeam && onToggle(agent.id)}
                  className={`inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[14.5px] font-extrabold transition-all duration-300 ${
                    inTeam
                      ? "cursor-default bg-white text-ink shadow-soft ring-1 ring-line"
                      : "text-white hover:-translate-y-0.5"
                  }`}
                  style={inTeam ? undefined : { backgroundColor: agent.color }}
                >
                  {inTeam ? (
                    <>
                      <Icon name="check" size={17} strokeWidth={2.2} /> In your team
                    </>
                  ) : (
                    <>
                      <Icon name="plus" size={17} strokeWidth={2.2} /> Add to my team
                    </>
                  )}
                </button>
                <button
                  onClick={() => goHome("agents")}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-6 py-3.5 text-[14px] font-bold text-ink transition-all duration-300 hover:border-ink hover:bg-white"
                >
                  Review the order
                  <Icon name="arrowUpRight" size={15} />
                </button>
              </div>
              <p className="font-mono text-[11.5px] text-faint">
                {inTeam && n > 1
                  ? "The Judge synthesizes this agent for free."
                  : inTeam
                    ? `Add 1 more agent — the Judge ($${JUDGE_PRICE}) becomes free.`
                    : `With 2+ agents the Judge is free (normally $${JUDGE_PRICE}).`}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* stats strip */}
      <Reveal delay={140}>
        <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {data.stats.map((s) => (
            <div key={s.k} className="rounded-[20px] border border-line bg-card px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
              <dd className="font-display text-[26px] font-semibold text-ink">{s.v}</dd>
              <dt className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{s.k}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* what it reads */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>
            Inputs
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">What it reads</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {data.reads.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <div className="group flex h-full gap-4 rounded-[22px] border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: `${agent.color}17`, color: agent.color }}
                >
                  <Icon name={r.icon} size={22} />
                </span>
                <div>
                  <h3 className="text-[16px] font-extrabold">{r.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-sub">{r.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* sample report */}
      <section className="mt-20">
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>
                Sample report
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">
                {agent.name} on {data.sample.ticker}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-line bg-card px-4 py-2 font-mono text-[12px] font-semibold text-sub">
                {data.sample.date}
              </span>
              <SignalChip kind={data.sample.signal} />
              <span className="rounded-full bg-ink px-4 py-2 font-mono text-[12px] font-bold text-white">
                confidence {data.sample.confidence}%
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-7 rounded-[22px] border border-line bg-white p-6 md:p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Executive brief</p>
            <ul className="mt-4 space-y-3">
              {data.sample.summary.map((s, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
                  <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: agent.color }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={160}>{reportBody()}</Reveal>

        <Reveal delay={200}>
          <p className="mt-5 flex items-center gap-2 font-mono text-[11.5px] text-faint">
            <Icon name="lock" size={13} />
            Sample data for illustration. Live runs use real-time market data at execution time.
          </p>
        </Reveal>
      </section>

      {/* methodology */}
      <section className="mt-20">
        <Reveal>
          <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>
            Methodology
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">How it works</h2>
        </Reveal>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {data.methodology.map((m, i) => (
            <Reveal key={m.title} delay={i * 90} as="li">
              <div className="group h-full rounded-[22px] border border-line bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <span className="font-display text-[40px] font-semibold leading-none" style={{ color: `${agent.color}55` }}>
                  {i + 1}
                </span>
                <h3 className="mt-4 text-[17px] font-extrabold">{m.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-sub">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* strengths / blind spots */}
      <section className="mt-20 grid gap-5 md:grid-cols-2">
        <Reveal>
          <div className="h-full rounded-[22px] border border-line bg-card p-7">
            <p className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1b7a41]">
              <Icon name="check" size={15} strokeWidth={2.2} /> Where it shines
            </p>
            <ul className="mt-5 space-y-3.5">
              {data.strengths.map((s) => (
                <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-ink/90">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="h-full rounded-[22px] border border-line bg-card p-7">
            <p className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#b3271e]">
              <Icon name="bolt" size={15} /> Known blind spots
            </p>
            <ul className="mt-5 space-y-3.5">
              {data.blindSpots.map((s) => (
                <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-ink/90">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-flame/80" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed text-faint">
              This is exactly why the Judge weighs {plural(5, "agent", "agents")} — blind spots don't overlap.
            </p>
          </div>
        </Reveal>
      </section>

      {/* bottom CTA */}
      <Reveal delay={120}>
        <div className="relative mt-20 overflow-hidden rounded-[32px] bg-ink px-8 py-14 text-white md:py-16">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full"
            style={{ background: `radial-gradient(circle, ${agent.color}66, transparent 70%)` }}
          />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.4),transparent_70%)]" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">
                Put the {agent.name} agent on the case.
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">
                ${agent.price} per analysis. Add two or more agents — and the Judge's synthesis comes free.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!inTeam) onToggle(agent.id);
                  goHome("agents");
                }}
                className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: "#ffffff" }}
              >
                {inTeam ? "Review the order" : `Add for $${agent.price}`}
                <Icon name="arrowUpRight" size={16} />
              </button>
              <button
                onClick={() => goHome("agents")}
                className="text-center font-mono text-[12px] text-white/50 transition-colors hover:text-white"
              >
                or assemble the full council →
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
