import { AGENT_PAGES } from "../data/agentMock";
import { type AgentDef, type AgentId } from "../lib/engine";
import Icon from "./Icon";

interface Props {
  agent: AgentDef;
  selected: AgentId[];
  onToggle: (id: AgentId) => void;
  goHome: (section?: string) => void;
}

export default function AgentPage({ agent, selected, onToggle, goHome }: Props) {
  const data = AGENT_PAGES[agent.id];
  const inTeam = selected.includes(agent.id);
  const agentIdx = agent.id === "tech" ? "01" : agent.id === "fund" ? "02" : agent.id === "port" ? "03" : agent.id === "news" ? "04" : "05";

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-24 md:px-8 lg:pt-32">
      <nav className="flex flex-wrap items-center gap-2.5 font-mono text-[12px] text-faint">
        <a href="#/" className="transition-colors hover:text-ink">Synapse Judgement</a>
        <span>/</span>
        <button onClick={() => goHome("agents")} className="transition-colors hover:text-ink">Agents</button>
        <span>/</span>
        <span className="font-semibold text-ink">{agent.name}</span>
      </nav>

      <div className="relative mt-8 overflow-hidden rounded-[32px] border border-line p-8 md:p-12" style={{ background: `linear-gradient(135deg, ${agent.color}17, ${agent.color}04 60%, transparent)` }}>
        <span className="pointer-events-none absolute -right-4 -top-10 select-none font-display text-[180px] font-bold leading-none opacity-[0.07] md:text-[260px]" style={{ color: agent.color }} aria-hidden="true">{agentIdx}</span>
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-[20px] text-white shadow-lift" style={{ backgroundColor: agent.color }}>
                <Icon name={agent.id} size={32} />
              </span>
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>Agent {agentIdx} · {agent.speed} per run</p>
                <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink md:text-[42px] md:leading-[1.05]">{agent.name}</h1>
              </div>
            </div>
            <p className="mt-5 text-[16.5px] leading-relaxed text-sub">{data.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {agent.tags.map((t) => (<span key={t} className="rounded-full border border-line bg-white/80 px-3 py-1.5 font-mono text-[11.5px] font-semibold text-sub">{t}</span>))}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <p className="font-mono text-[30px] font-bold text-ink">${agent.price}<span className="text-[13px] font-medium text-faint"> / analysis</span></p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => !inTeam && onToggle(agent.id)} className={`inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-[14.5px] font-extrabold transition-all duration-300 ${inTeam ? "cursor-default bg-white text-ink shadow-soft ring-1 ring-line" : "text-white hover:-translate-y-0.5"}`} style={inTeam ? undefined : { backgroundColor: agent.color }}>
                {inTeam ? (<><Icon name="check" size={17} strokeWidth={2.2} /> In your team</>) : (<><Icon name="plus" size={17} strokeWidth={2.2} /> Add to my team</>)}
              </button>
              <button onClick={() => goHome("agents")} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-6 py-3.5 text-[14px] font-bold text-ink transition-all duration-300 hover:border-ink hover:bg-white">Review the order<Icon name="arrowUpRight" size={15} /></button>
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {data.stats.map((s) => (
          <div key={s.k} className="rounded-[20px] border border-line bg-card px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
            <dd className="font-display text-[26px] font-semibold text-ink">{s.v}</dd>
            <dt className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{s.k}</dt>
          </div>
        ))}
      </dl>

      <section className="mt-20">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>Inputs</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">What it reads</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {data.reads.map((r: any, i: number) => (
            <div key={r.title} className="group flex h-full gap-4 rounded-[22px] border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: `${agent.color}17`, color: agent.color }}>
                <Icon name={r.icon} size={22} />
              </span>
              <div>
                <h3 className="text-[16px] font-extrabold">{r.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-sub">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>Sample report</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">{agent.name} on {data.sample.ticker}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-line bg-card px-4 py-2 font-mono text-[12px] font-semibold text-sub">{data.sample.date}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[12px] font-semibold ${data.sample.signal === "bull" ? "bg-[#e9f9ef] text-[#1b7a41]" : data.sample.signal === "bear" ? "bg-[#fdeceb] text-[#b3271e]" : "bg-paper text-sub"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${data.sample.signal === "bull" ? "bg-mint" : data.sample.signal === "bear" ? "bg-flame" : "bg-faint"}`} />
              {data.sample.signal === "bull" ? "Bullish" : data.sample.signal === "bear" ? "Bearish" : "Neutral"}
            </span>
            <span className="rounded-full bg-ink px-4 py-2 font-mono text-[12px] font-bold text-white">confidence {data.sample.confidence}%</span>
          </div>
        </div>
        <div className="mt-7 rounded-[22px] border border-line bg-white p-6 md:p-7">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Executive brief</p>
          <ul className="mt-4 space-y-3">
            {data.sample.summary.map((s: string, i: number) => (
              <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/90">
                <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: agent.color }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 rounded-[22px] border border-dashed border-line bg-card/50 p-6 text-center">
          <p className="font-mono text-[11.5px] text-faint">Sample data for illustration. Live runs use real-time market data at execution time.</p>
        </div>
      </section>

      <section className="mt-20">
        <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em]" style={{ color: agent.color }}>Methodology</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] md:text-4xl">How it works</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {data.methodology.map((m: any, i: number) => (
            <div key={m.title} className="group h-full rounded-[22px] border border-line bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="font-display text-[40px] font-semibold leading-none" style={{ color: `${agent.color}55` }}>{i + 1}</span>
              <h3 className="mt-4 text-[17px] font-extrabold">{m.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-sub">{m.text}</p>
            </div>
          ))}
        </ol>
      </section>

      <section className="mt-20 grid gap-5 md:grid-cols-2">
        <div className="h-full rounded-[22px] border border-line bg-card p-7">
          <p className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1b7a41]">
            <Icon name="check" size={15} strokeWidth={2.2} /> Where it shines
          </p>
          <ul className="mt-5 space-y-3.5">
            {data.strengths.map((s: string) => (
              <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-ink/90">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="h-full rounded-[22px] border border-line bg-card p-7">
          <p className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-[#b3271e]">
            <Icon name="bolt" size={15} /> Known blind spots
          </p>
          <ul className="mt-5 space-y-3.5">
            {data.blindSpots.map((s: string) => (
              <li key={s} className="flex gap-3 text-[14.5px] leading-relaxed text-ink/90">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-flame/80" />{s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="relative mt-20 overflow-hidden rounded-[32px] bg-ink px-8 py-14 text-white md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full" style={{ background: `radial-gradient(circle, ${agent.color}66, transparent 70%)` }} />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">Put the {agent.name} agent on the case.</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">${agent.price} per analysis. Add two or more agents — and the Judge's synthesis comes free.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { if (!inTeam) onToggle(agent.id); goHome("agents"); }} className="inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5">
              {inTeam ? "Review the order" : `Add for $${agent.price}`}
              <Icon name="arrowUpRight" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
