import Icon from "./Icon";
import Reveal from "./Reveal";
import { AGENTS, JUDGE_NAME, JUDGE_PRICE, plural, type AgentId } from "../lib/engine";

function Toggle({ on, color, onToggle, label }: { on: boolean; color: string; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-300 ${on ? "" : "bg-[#e9e9eb] hover:bg-[#dcdce0]"}`}
      style={on ? { backgroundColor: color } : undefined}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-7 w-7 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.2)] ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

interface Props {
  selected: AgentId[];
  onToggle: (id: AgentId) => void;
}

export default function AgentStore({ selected, onToggle }: Props) {
  const n = selected.length;
  const judgeFree = n > 1;

  return (
    <section id="agents" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">02 · Agent shop</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Assemble your council</h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-sub">
            Pay only for the analysts you need. The price updates instantly — before you run anything.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a, i) => {
          const on = selected.includes(a.id);
          return (
            <Reveal key={a.id} delay={i * 80}>
              <div
                role="button"
                tabIndex={0}
                aria-pressed={on}
                onClick={() => onToggle(a.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(a.id);
                  }
                }}
                className={`group relative h-full cursor-pointer rounded-[24px] border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-accent ${
                  on ? "border-transparent" : "border-line"
                }`}
                style={
                  on
                    ? { boxShadow: `0 0 0 1.5px ${a.color}, 0 18px 44px ${a.color}1f`, backgroundColor: `${a.color}0a` }
                    : undefined
                }
              >
                <div className="flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-[15px] transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: `${a.color}17`, color: a.color }}
                  >
                    <Icon name={a.id} size={26} />
                  </span>
                  <Toggle on={on} color={a.color} onToggle={() => onToggle(a.id)} label={`Agent “${a.name}”`} />
                </div>

                <h3 className="mt-5 text-[21px] font-extrabold tracking-tight">{a.name}</h3>
                <p className="mt-2 min-h-[66px] text-[14.5px] leading-relaxed text-sub">{a.desc}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {a.tags.map((t) => (
                    <span key={t} className="rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-faint">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <p className="font-mono text-[16px] font-bold text-ink">
                    ${a.price}
                    <span className="text-[12px] font-medium text-faint"> / analysis</span>
                  </p>
                  <span
                    className={`flex items-center gap-1.5 font-mono text-[11.5px] font-semibold transition-colors duration-300 ${
                      on ? "text-ink" : "text-faint"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${on ? "bg-mint" : "bg-line"}`} />
                    {on ? "in the order" : a.speed}
                  </span>
                </div>
              </div>
            </Reveal>
          );
        })}

        {/* judge teaser tile */}
        <Reveal delay={400}>
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-dashed border-line bg-white p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.12),transparent_70%)]" />
            <div>
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet text-white">
                  <Icon name="judge" size={26} />
                </span>
                <span className="rounded-full bg-paper px-3 py-1 font-mono text-[11px] font-semibold text-sub">not for sale</span>
              </div>
              <h3 className="mt-5 text-[21px] font-extrabold tracking-tight">{JUDGE_NAME}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-sub">
                The sixth agent isn’t selected — it shows up on its own whenever briefs need to be merged into a single verdict.
              </p>
            </div>
            <div className="mt-6 border-t border-line pt-5">
              <p className="font-mono text-[16px] font-bold text-ink">
                $0 <span className="text-[12px] font-medium text-faint">with 2+ agents</span>
                <span className="ml-2 text-[12px] font-medium text-faint line-through">${JUDGE_PRICE}</span>
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* judge plate: free */}
      <div className={`acc-body ${judgeFree ? "open" : ""} mt-6`}>
        <div className="acc-inner">
          <div className="rounded-[22px] bg-gradient-to-r from-accent to-violet p-[1.5px] shadow-[0_16px_44px_rgba(0,122,255,0.22)]">
            <div className="flex flex-wrap items-center gap-4 rounded-[20.5px] bg-white px-6 py-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-white">
                <Icon name="judge" size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">The Judge is connected — free</p>
                <p className="text-[13.5px] text-sub">
                  It will synthesize {n} {plural(n, "brief", "briefs")} into one verdict, with reasoning and a confidence score.
                </p>
              </div>
              <p className="font-mono text-[15px] font-bold">
                <span className="mr-2 text-faint line-through">${JUDGE_PRICE}</span>
                <span className="text-mint">$0</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* judge plate: hint */}
      <div className={`acc-body ${judgeFree ? "" : "open"} mt-6`}>
        <div className="acc-inner">
          <div className="flex flex-wrap items-center gap-4 rounded-[22px] border border-dashed border-line bg-card px-6 py-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-faint">
              <Icon name="lock" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">
                {n === 0 ? "The Judge is waiting for a team" : "Add one more agent"}
              </p>
              <p className="text-[13.5px] text-sub">
                With two or more agents, the Judge’s synthesis is free. Selected {Math.min(n, 2)} of 2.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 1].map((d) => (
                <span
                  key={d}
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${n > d ? "bg-accent" : "bg-line"}`}
                />
              ))}
              <span className="ml-1 font-mono text-[11px] font-semibold text-faint">{Math.min(n, 2)}/2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
