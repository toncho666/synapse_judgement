import Icon from "./Icon";
import { useScrolled } from "../lib/hooks";
import { AGENTS, fmtMoney, JUDGE_PRICE, type AgentId } from "../lib/engine";
import type { Stage } from "./ResultsDashboard";

interface Props {
  selected: AgentId[];
  total: number;
  judgeFree: boolean;
  stage: Stage;
  processed: number;
  onRun: () => void;
  onNewSession: () => void;
}

export default function StickyBar({ selected, total, judgeFree, stage, processed, onRun, onNewSession }: Props) {
  const past = useScrolled(640);
  const count = selected.length;
  const active = count > 0 && stage === "idle";
  const chosen = AGENTS.filter((a) => selected.includes(a.id));

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-out ${
        past ? "translate-y-0" : "translate-y-[115%]"
      }`}
    >
      <div className="mx-auto mb-4 max-w-6xl px-4 md:px-8">
        <div className="flex items-center gap-4 overflow-hidden rounded-full border border-line bg-white/90 p-2 pl-5 shadow-bar backdrop-blur-xl md:gap-5 md:pl-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
            <div className="hidden sm:flex">
              {count === 0 ? (
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line text-faint">
                  <Icon name="plus" size={18} />
                </span>
              ) : (
                <div className="flex -space-x-2.5">
                  {chosen.map((a) => (
                    <span
                      key={a.id}
                      title={a.name}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-soft"
                      style={{ backgroundColor: `${a.color}17`, color: a.color }}
                    >
                      <Icon name={a.id} size={19} />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold uppercase tracking-[0.14em] text-faint">
                {stage === "running"
                  ? "Analysis running"
                  : stage !== "idle"
                    ? "Session complete"
                    : "Your order"}
              </p>
              {stage === "running" ? (
                <p className="truncate font-mono text-[13.5px] font-semibold text-ink">
                  {processed}/{count} agents ready…
                </p>
              ) : stage !== "idle" ? (
                <a href="#result" className="truncate font-mono text-[13.5px] font-semibold text-accent hover:text-violet">
                  Verdict ready — open the dashboard ↓
                </a>
              ) : count === 0 ? (
                <p className="truncate text-[13.5px] text-sub">No agents selected — flip a switch above</p>
              ) : (
                <p className="truncate font-mono text-[13.5px] text-sub">
                  {count} {count > 1 ? "agents" : "agent"} · The Judge{" "}
                  {judgeFree ? <span className="font-semibold text-mint">free</span> : `+$${JUDGE_PRICE}`}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">Total</p>
            <p key={total} className="anim-fade-up font-mono text-[20px] font-bold leading-tight text-ink md:text-[22px]">
              {fmtMoney(total)}
            </p>
          </div>

          {stage === "running" ? (
            <button
              disabled
              className="flex shrink-0 cursor-wait items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-bold text-white md:px-7"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Working…</span>
            </button>
          ) : stage !== "idle" ? (
            <button
              onClick={() => {
                onNewSession();
                document.getElementById("agents")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="shrink-0 rounded-full border-2 border-ink px-6 py-3 font-bold text-ink transition-all duration-300 hover:bg-ink hover:text-white md:px-7"
            >
              New session
            </button>
          ) : (
            <button
              onClick={onRun}
              disabled={!active}
              className={`shrink-0 rounded-full px-6 py-3.5 font-bold transition-all duration-300 md:px-7 ${
                active
                  ? "anim-halo bg-gradient-to-r from-accent to-violet text-white hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,122,255,0.45)]"
                  : "cursor-not-allowed bg-ink/10 text-ink/35"
              }`}
            >
              Run analysis
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
