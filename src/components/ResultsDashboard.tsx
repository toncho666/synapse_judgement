import Icon from "./Icon";
import Reveal from "./Reveal";
import { useCountUp } from "../lib/hooks";
import {
  AGENTS, fmtMoney, JUDGE_NAME, plural,
  type SessionResult, type Signal,
} from "../lib/engine";

export type Stage = "idle" | "running" | "agents" | "verdict";

const SIGNAL_META: Record<Signal, { label: string; cls: string; dot: string }> = {
  bull: { label: "Bullish signal", cls: "bg-[#e9f9ef] text-[#1b7a41]", dot: "bg-mint" },
  bear: { label: "Bearish signal", cls: "bg-[#fdeceb] text-[#b3271e]", dot: "bg-flame" },
  flat: { label: "Neutral", cls: "bg-paper text-sub", dot: "bg-faint" },
};

const VERDICT_COLOR = { BUY: "#30d158", SELL: "#ff453a", HOLD: "#ff9f0a" } as const;

function defOf(id: string) {
  return AGENTS.find((a) => a.id === id)!;
}

interface Props {
  stage: Stage;
  result: SessionResult | null;
  totalCost: number;
  processed: number;
  onRevealVerdict: () => void;
  onNewSession: () => void;
}

export default function ResultsDashboard({
  stage, result, totalCost, processed, onRevealVerdict, onNewSession,
}: Props) {
  const n = result?.agents.length ?? 0;

  const conf = useCountUp(result?.verdictConfidence ?? 0, stage === "verdict", 1400);
  const done = stage === "agents" || stage === "verdict";

  return (
    <section id="result" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">04 · Session protocol</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">The result</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-sub">
            A feed of every analyst’s brief — with the Judge’s decision on top.
          </p>
        </div>
      </Reveal>

      {!result ? (
        <Reveal delay={120}>
          <div className="mt-12 rounded-[28px] border-2 border-dashed border-line bg-card/50 px-8 py-20 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper text-faint">
              <Icon name="gauge" size={30} />
            </span>
            <h3 className="mt-6 text-2xl font-extrabold tracking-tight">The dashboard assembles here</h3>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-sub">
              Pick your agents, enter a ticker and press “Run analysis”. In about 90 seconds this space
              fills with the analysts’ briefs and the Judge’s verdict.
            </p>
            <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-faint">session · awaiting request</p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* ------- feed ------- */}
          <div className="rounded-[28px] border border-line bg-card shadow-soft">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-7 py-6">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
                  session {result.session} · {result.agents.length} {plural(result.agents.length, "agent", "agents")} · {fmtMoney(totalCost)}
                </p>
                <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight text-ink">
                  {result.ticker}
                </p>
              </div>
              <div className="text-right font-mono text-[13px]">
                <p className="text-faint">last price</p>
                <p className="text-lg font-bold text-ink">${result.basePrice.toFixed(2)}</p>
              </div>
            </header>

            <div>
              {result.agents.map((v, idx) => {
                const def = defOf(v.agentId);
                const meta = SIGNAL_META[v.signal];
                const isDone = done || idx < processed;
                const isCurrent = stage === "running" && idx === processed;
                return (
                  <article key={v.agentId} className={`border-b border-line px-7 py-6 last:border-b-0 ${isCurrent ? "bg-white" : ""}`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-[11px]"
                        style={{ backgroundColor: `${def.color}17`, color: def.color }}
                      >
                        <Icon name={def.id} size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15.5px] font-extrabold">{def.name}</h3>
                        <p className="font-mono text-[11px] text-faint">confidence {v.confidence}%</p>
                      </div>
                      {isDone ? (
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11.5px] font-semibold ${meta.cls}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 font-mono text-[11.5px] font-semibold text-faint">
                          {isCurrent ? (
                            <>
                              analyzing
                              <span className="flex gap-0.5">
                                <span className="dot-blink h-1 w-1 rounded-full bg-current" />
                                <span className="dot-blink h-1 w-1 rounded-full bg-current" />
                                <span className="dot-blink h-1 w-1 rounded-full bg-current" />
                              </span>
                            </>
                          ) : (
                            "queued"
                          )}
                        </span>
                      )}
                    </div>

                    {isDone ? (
                      <div className="anim-fade-up mt-4">
                        <ul className="space-y-2">
                          {v.lines.map((l, i) => (
                            <li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink/90">
                              <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: def.color }} />
                              {l}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {v.metrics.map((m) => (
                            <span key={m.label} className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-mono text-[11.5px]">
                              <span className="text-faint">{m.label}</span>{" "}
                              <span className="font-semibold text-ink">{m.value}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 space-y-2.5">
                        <div className="shimmer h-3.5 w-[92%] rounded-md" />
                        <div className="shimmer h-3.5 w-[78%] rounded-md" />
                        <div className="shimmer h-3.5 w-[56%] rounded-md" />
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* ------- judge panel ------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 text-white shadow-[0_32px_80px_rgba(29,29,31,0.35)]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.5),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.35),transparent_70%)]" />

              <header className="relative flex items-center gap-3.5">
                <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet">
                  <Icon name="judge" size={24} />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">{JUDGE_NAME}</h3>
                  <p className="font-mono text-[11px] text-white/50">
                    synthesis of {result.agents.length} {plural(result.agents.length, "brief", "briefs")} · weight = confidence
                  </p>
                </div>
              </header>

              {stage === "running" && (
                <div className="relative mt-9">
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">awaiting briefs</p>
                  <p className="mt-3 text-2xl font-extrabold">
                    Agents are working
                    <span className="dot-blink">.</span>
                    <span className="dot-blink">.</span>
                    <span className="dot-blink">.</span>
                  </p>
                  <p className="mt-2 font-mono text-[13px] text-white/60">{Math.min(processed, n)} / {n} briefs ready</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500"
                      style={{ width: `${(Math.min(processed, n) / Math.max(1, n)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {stage === "agents" && (
                <div className="anim-fade-up relative mt-9 text-center">
                  <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">verdict ready</p>
                  <p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-white/70">
                    All briefs are in. The Judge has weighed the arguments and is ready to deliver.
                  </p>
                  <button
                    onClick={onRevealVerdict}
                    className="anim-halo-white mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-extrabold text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-95"
                  >
                    <Icon name="judge" size={18} />
                    Get the verdict
                  </button>
                </div>
              )}

              {stage === "verdict" && (
                <div className="anim-verdict relative mt-8">
                  <div className="text-center">
                    <p
                      className="font-display text-[52px] font-bold leading-none tracking-tight md:text-[62px]"
                      style={{ color: VERDICT_COLOR[result.verdict], textShadow: `0 0 44px ${VERDICT_COLOR[result.verdict]}55` }}
                    >
                      {result.verdict}
                    </p>
                    <p className="mt-2.5 text-[15px] font-semibold text-white/60">{result.verdictWord} · {result.ticker}</p>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-end justify-between font-mono text-[12px] text-white/50">
                      <span>confidence</span>
                      <span className="text-[22px] font-bold text-white">{conf}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-[width] duration-[1400ms] ease-out"
                        style={{ width: stage === "verdict" ? `${conf}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3 font-mono text-[12.5px]">
                    <div className="rounded-[14px] bg-white/[0.06] px-4 py-3.5">
                      <p className="text-white/45">target price</p>
                      <p className="mt-1 text-[16px] font-bold text-white">${result.target.toFixed(2)}</p>
                    </div>
                    <div className="rounded-[14px] bg-white/[0.06] px-4 py-3.5">
                      <p className="text-white/45">upside</p>
                      <p
                        className="mt-1 text-[16px] font-bold"
                        style={{ color: result.target >= result.basePrice ? "#30d158" : "#ff453a" }}
                      >
                        {result.target >= result.basePrice ? "+" : ""}
                        {(((result.target - result.basePrice) / result.basePrice) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* consensus */}
                  <div className="mt-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">vote split</p>
                    <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-white/10">
                      {result.consensus.bull > 0 && (
                        <span className="h-full bg-mint" style={{ width: `${(result.consensus.bull / n) * 100}%` }} />
                      )}
                      {result.consensus.flat > 0 && (
                        <span className="h-full bg-white/30" style={{ width: `${(result.consensus.flat / n) * 100}%` }} />
                      )}
                      {result.consensus.bear > 0 && (
                        <span className="h-full bg-flame" style={{ width: `${(result.consensus.bear / n) * 100}%` }} />
                      )}
                    </div>
                    <div className="mt-2.5 flex gap-5 font-mono text-[11.5px] text-white/55">
                      <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-mint" />for — {result.consensus.bull}</span>
                      <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-white/40" />neutral — {result.consensus.flat}</span>
                      <span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-flame" />against — {result.consensus.bear}</span>
                    </div>
                  </div>

                  {/* rationale */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">reasoning</p>
                    <ul className="mt-3 space-y-2.5">
                      {result.rationale.map((r, i) => (
                        <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/80">
                          <Icon name="spark" size={14} className="mt-1 shrink-0" style={{ color: "#8f8df0" }} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={onNewSession}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-[14px] font-bold text-white/85 transition-all duration-300 hover:border-white/50 hover:bg-white/5"
                  >
                    <Icon name="refresh" size={16} />
                    New session
                  </button>
                  <p className="mt-4 text-center text-[11px] leading-relaxed text-white/35">
                    The verdict is an analytical synthesis, not individual investment advice.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
