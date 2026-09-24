import { useState, useEffect } from "react";
import Icon from "./Icon";
import { getUser, getSessions, getStats, logout, upgradePlan, type User, type Session } from "../lib/auth";
import { HBars, SignalChip } from "./viz";

interface Props {
  onLogout: () => void;
  onHome: () => void;
}

export default function Dashboard({ onLogout, onHome }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tab, setTab] = useState<"overview" | "history" | "achievements" | "billing">("overview");

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setSessions(getSessions());
  }, []);

  if (!user) return null;

  const stats = getStats();

  const handleUpgrade = (plan: 'pro' | 'enterprise') => {
    const updated = upgradePlan(plan);
    if (updated) setUser(updated);
  };

  return (
    <div className="relative min-h-screen bg-white">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08),transparent_65%)]" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <button onClick={onHome} className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-accent to-violet">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="6" r="2.4" fill="white" stroke="none" />
                <circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                <circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" />
                <path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" />
              </svg>
            </span>
            <span className="leading-none">
              <span className="block text-[17px] font-extrabold tracking-tight text-ink">Synapse</span>
              <span className="block font-display text-[8.5px] font-semibold uppercase tracking-[0.26em] text-faint">Judgement</span>
            </span>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-[12px] font-bold text-ink md:flex">
              <Icon name="spark" size={14} className="text-amber" />
              {user.credits} credits
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-[18px]">
                {user.avatar}
              </span>
              <div className="hidden md:block">
                <p className="text-[13px] font-bold text-ink">{user.name}</p>
                <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{user.plan} plan</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); onLogout(); }}
              className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-sub transition-all duration-300 hover:border-flame hover:text-flame"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8">
        {/* welcome */}
        <div className="mb-10">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Dashboard</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
            Welcome back, {user.name.split(' ')[0]}.
          </h1>
          <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-sub">
            Here's your analytics overview, session history and everything about your council.
          </p>
        </div>

        {/* tabs */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-card p-1">
          {(["overview", "history", "achievements", "billing"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[13.5px] font-bold capitalize transition-all duration-300 ${
                tab === t ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"
              }`}
            >
              {t === "billing" ? "Plan & Billing" : t}
            </button>
          ))}
        </div>

        {/* overview */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total sessions", value: stats.totalSessions, icon: "layers", color: "#007AFF" },
                { label: "Total spent", value: "$" + stats.totalSpent, icon: "bolt", color: "#FF9500" },
                { label: "Avg confidence", value: stats.avgConfidence + "%", icon: "gauge", color: "#5856D6" },
                { label: "Avg accuracy", value: stats.avgAccuracy + "%", icon: "target", color: "#34c759" },
              ].map((s) => (
                <div key={s.label} className="rounded-[20px] border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{s.label}</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: `${s.color}17`, color: s.color }}>
                      <Icon name={s.icon as any} size={18} />
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-[32px] font-bold text-ink">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* agent usage */}
              <div className="rounded-[24px] border border-line bg-card p-7">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Agent usage</p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Most used analysts</h3>
                <div className="mt-5">
                  <HBars
                    items={Object.entries(stats.agentUsage)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([label, value]) => ({
                        label,
                        value,
                        display: `${value} sessions`,
                        max: Math.max(...Object.values(stats.agentUsage)),
                      }))}
                    color="#007AFF"
                  />
                </div>
              </div>

              {/* verdict distribution */}
              <div className="rounded-[24px] border border-line bg-card p-7">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Verdict distribution</p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">What the Judge decided</h3>
                <div className="mt-5 flex items-end gap-4">
                  {[
                    { label: "BUY", value: stats.verdictDistribution.BUY, color: "#30d158" },
                    { label: "HOLD", value: stats.verdictDistribution.HOLD, color: "#ff9f0a" },
                    { label: "SELL", value: stats.verdictDistribution.SELL, color: "#ff453a" },
                  ].map((v) => {
                    const total = stats.verdictDistribution.BUY + stats.verdictDistribution.HOLD + stats.verdictDistribution.SELL;
                    const pct = total > 0 ? Math.round((v.value / total) * 100) : 0;
                    return (
                      <div key={v.label} className="flex-1">
                        <div className="relative h-32 overflow-hidden rounded-[12px] bg-paper">
                          <div
                            className="absolute bottom-0 left-0 right-0 rounded-[12px] transition-all duration-700"
                            style={{ height: `${pct}%`, backgroundColor: v.color, opacity: 0.85 }}
                          />
                        </div>
                        <p className="mt-2.5 text-center font-mono text-[11px] font-semibold text-faint">{v.label}</p>
                        <p className="text-center font-mono text-[18px] font-bold text-ink">{pct}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* recent sessions */}
            <div className="rounded-[24px] border border-line bg-card p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Recent activity</p>
                  <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Latest sessions</h3>
                </div>
                <button onClick={() => setTab("history")} className="text-[13px] font-bold text-accent hover:text-violet">
                  View all →
                </button>
              </div>
              <div className="mt-5 space-y-3">
                {sessions.slice(0, 3).map((s) => (
                  <SessionRow key={s.id} session={s} />
                ))}
              </div>
            </div>

            {/* referral */}
            <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 text-white md:p-10">
              <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.4),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.4),transparent_70%)]" />
              <div className="relative">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Referral program</p>
                <h3 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                  Invite friends. Earn credits.
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">
                  Share your code — both you and your friend get 25 credits when they make their first analysis.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 font-mono text-[15px] font-bold">
                    <Icon name="spark" size={16} className="text-amber" />
                    {user.referralCode}
                  </div>
                  <button
                    onClick={() => navigator.clipboard?.writeText(user.referralCode)}
                    className="rounded-full bg-white px-6 py-3 text-[14px] font-bold text-ink transition-all duration-300 hover:scale-[1.03]"
                  >
                    Copy code
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* history */}
        {tab === "history" && (
          <div className="rounded-[24px] border border-line bg-card p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Session history</p>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">All your analyses</h3>
            <div className="mt-6 space-y-3">
              {sessions.length === 0 ? (
                <p className="py-12 text-center text-[14px] text-sub">No sessions yet. Run your first analysis!</p>
              ) : (
                sessions.map((s) => <SessionRow key={s.id} session={s} expanded />)
              )}
            </div>
          </div>
        )}

        {/* achievements */}
        {tab === "achievements" && (
          <div className="rounded-[24px] border border-line bg-card p-7">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Achievements</p>
            <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Your milestones</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.achievements.length === 0 ? (
                <p className="col-span-full py-12 text-center text-[14px] text-sub">No achievements yet. Start analyzing!</p>
              ) : (
                user.achievements.map((a) => (
                  <div key={a.id} className="rounded-[18px] border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                    <span className="text-[36px]">{a.icon}</span>
                    <h4 className="mt-3 text-[15px] font-extrabold">{a.title}</h4>
                    <p className="mt-1 text-[13px] leading-relaxed text-sub">{a.description}</p>
                    {a.unlockedAt && (
                      <p className="mt-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mint">
                        ✓ Unlocked
                      </p>
                    )}
                    {a.progress !== undefined && a.maxProgress !== undefined && (
                      <div className="mt-3">
                        <div className="h-1.5 overflow-hidden rounded-full bg-paper">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-violet"
                            style={{ width: `${Math.min(100, (a.progress / a.maxProgress) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-1.5 font-mono text-[10.5px] font-semibold text-faint">
                          {a.progress}/{a.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* billing */}
        {tab === "billing" && (
          <div className="space-y-8">
            <div className="rounded-[24px] border border-line bg-card p-7">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Current plan</p>
              <div className="mt-3 flex items-center gap-4">
                <span className={`rounded-full px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] ${
                  user.plan === 'enterprise' ? 'bg-gradient-to-r from-accent to-violet text-white' :
                  user.plan === 'pro' ? 'bg-amber/15 text-amber' : 'bg-paper text-sub'
                }`}>
                  {user.plan}
                </span>
                <span className="font-mono text-[14px] font-bold text-ink">{user.credits} credits remaining</span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  desc: "Try the platform",
                  features: ["50 credits on signup", "All 5 agents", "Basic verdicts", "Community support"],
                  current: user.plan === 'free',
                  cta: "Current plan",
                  disabled: true,
                },
                {
                  name: "Pro",
                  price: "$29",
                  period: "/month",
                  desc: "For active traders",
                  features: ["500 credits/month", "Priority processing", "Detailed reasoning", "Email support", "API access"],
                  current: user.plan === 'pro',
                  cta: user.plan === 'pro' ? "Current plan" : "Upgrade to Pro",
                  highlight: true,
                  onClick: () => handleUpgrade('pro'),
                  disabled: user.plan === 'pro',
                },
                {
                  name: "Enterprise",
                  price: "$99",
                  period: "/month",
                  desc: "For teams & funds",
                  features: ["2000 credits/month", "Custom agents", "White-label reports", "Dedicated support", "SLA guarantee", "Team seats"],
                  current: user.plan === 'enterprise',
                  cta: user.plan === 'enterprise' ? "Current plan" : "Upgrade to Enterprise",
                  onClick: () => handleUpgrade('enterprise'),
                  disabled: user.plan === 'enterprise',
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-[24px] border p-7 transition-all duration-300 ${
                    plan.highlight ? "border-accent bg-gradient-to-b from-[#f0f7ff] to-white shadow-lift" : "border-line bg-card hover:-translate-y-1 hover:shadow-soft"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-violet px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-[18px] font-extrabold">{plan.name}</h3>
                  <p className="mt-1 text-[13px] text-sub">{plan.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-mono text-[38px] font-bold text-ink">{plan.price}</span>
                    {plan.period && <span className="text-[13px] text-faint">{plan.period}</span>}
                  </div>
                  <ul className="mt-5 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[13.5px] text-sub">
                        <Icon name="check" size={14} className="shrink-0 text-mint" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={plan.onClick}
                    disabled={plan.disabled}
                    className={`mt-7 w-full rounded-full py-3 text-[14px] font-bold transition-all duration-300 ${
                      plan.disabled
                        ? "cursor-not-allowed bg-paper text-faint"
                        : plan.highlight
                          ? "bg-gradient-to-r from-accent to-violet text-white shadow-[0_12px_32px_rgba(0,122,255,0.3)] hover:-translate-y-0.5"
                          : "border-2 border-ink text-ink hover:bg-ink hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SessionRow({ session: s, expanded = false }: { session: Session; expanded?: boolean }) {
  const date = new Date(s.timestamp);
  const timeStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " +
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const upside = ((s.targetPrice - s.currentPrice) / s.currentPrice * 100).toFixed(1);

  return (
    <div className={`rounded-[16px] border border-line bg-white p-5 transition-all duration-300 hover:shadow-soft ${expanded ? "p-6" : ""}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-accent/10 to-violet/10 font-mono text-[15px] font-bold text-ink">
            {s.ticker.slice(0, 2)}
          </span>
          <div>
            <p className="text-[15px] font-extrabold">{s.ticker}</p>
            <p className="font-mono text-[11px] text-faint">{timeStr}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {s.agents.map((a) => (
            <span key={a} className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10.5px] font-semibold text-sub">
              {a}
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          <SignalChip kind={s.verdict === "BUY" ? "bull" : s.verdict === "SELL" ? "bear" : "flat"} />
          <div className="text-right">
            <p className="font-mono text-[11px] text-faint">confidence</p>
            <p className="font-mono text-[15px] font-bold text-ink">{s.confidence}%</p>
          </div>
          {s.accuracy !== undefined && (
            <div className="text-right">
              <p className="font-mono text-[11px] text-faint">accuracy</p>
              <p className="font-mono text-[15px] font-bold text-mint">{s.accuracy}%</p>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 font-mono text-[12px]">
          <span className="text-sub">Target: <strong className="text-ink">${s.targetPrice.toFixed(2)}</strong></span>
          <span className="text-sub">Current: <strong className="text-ink">${s.currentPrice.toFixed(2)}</strong></span>
          <span className={Number(upside) >= 0 ? "text-mint" : "text-flame"}>
            Upside: <strong>{Number(upside) >= 0 ? "+" : ""}{upside}%</strong>
          </span>
          <span className="text-sub">Cost: <strong className="text-ink">${s.cost}</strong></span>
        </div>
      )}
    </div>
  );
}
