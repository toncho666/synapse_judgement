import Icon from "./Icon";
import Reveal from "./Reveal";

// Mock leaderboard data
const LEADERBOARD = [
  { rank: 1, name: "Alex M.", avatar: "🦊", accuracy: 94.2, sessions: 187, streak: 42, plan: "enterprise" },
  { rank: 2, name: "Sarah K.", avatar: "🦉", accuracy: 92.8, sessions: 156, streak: 38, plan: "pro" },
  { rank: 3, name: "David L.", avatar: "🐺", accuracy: 91.5, sessions: 203, streak: 35, plan: "enterprise" },
  { rank: 4, name: "Emma R.", avatar: "🦅", accuracy: 90.1, sessions: 134, streak: 29, plan: "pro" },
  { rank: 5, name: "James W.", avatar: "🐻", accuracy: 89.7, sessions: 178, streak: 27, plan: "pro" },
  { rank: 6, name: "Olivia T.", avatar: "🦋", accuracy: 88.9, sessions: 112, streak: 24, plan: "pro" },
  { rank: 7, name: "Noah B.", avatar: "🐬", accuracy: 88.2, sessions: 145, streak: 22, plan: "enterprise" },
  { rank: 8, name: "Ava P.", avatar: "🦚", accuracy: 87.6, sessions: 98, streak: 19, plan: "pro" },
  { rank: 9, name: "Liam C.", avatar: "🐯", accuracy: 87.1, sessions: 167, streak: 18, plan: "pro" },
  { rank: 10, name: "Mia S.", avatar: "🦜", accuracy: 86.4, sessions: 89, streak: 15, plan: "free" },
];

const RECENT_VERDICTS = [
  { ticker: "NVDA", verdict: "BUY", confidence: 91, user: "Alex M.", time: "2h ago" },
  { ticker: "AAPL", verdict: "HOLD", confidence: 78, user: "Sarah K.", time: "3h ago" },
  { ticker: "TSLA", verdict: "BUY", confidence: 84, user: "David L.", time: "5h ago" },
  { ticker: "META", verdict: "SELL", confidence: 82, user: "Emma R.", time: "6h ago" },
  { ticker: "AMZN", verdict: "BUY", confidence: 88, user: "James W.", time: "8h ago" },
];

interface Props {
  onBack: () => void;
  onAuth: () => void;
}

export default function Leaderboard({ onBack, onAuth }: Props) {
  return (
    <div className="relative min-h-screen bg-white">
      {/* ambient */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08),transparent_65%)]" />
        <div className="anim-drift2 absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.08),transparent_65%)]" />
      </div>

      {/* header */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <button onClick={onBack} className="flex items-center gap-2.5">
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
          <button
            onClick={onAuth}
            className="rounded-full bg-gradient-to-r from-accent to-violet px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all duration-300 hover:-translate-y-0.5"
          >
            Join the court
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-12 md:px-8">
        {/* hero */}
        <Reveal>
          <div className="text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Leaderboard</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
              The most accurate minds.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-sub">
              Real users. Real verdicts. See who's getting it right — and join the court.
            </p>
          </div>
        </Reveal>

        {/* stats */}
        <Reveal delay={100}>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active analysts", value: "2,847", icon: "layers" },
              { label: "Verdicts this week", value: "12,439", icon: "gauge" },
              { label: "Avg accuracy", value: "87.3%", icon: "target" },
            ].map((s) => (
              <div key={s.label} className="rounded-[18px] border border-line bg-card p-5 text-center">
                <span className="flex h-10 w-10 mx-auto items-center justify-center rounded-[11px] bg-accent/10 text-accent">
                  <Icon name={s.icon as any} size={20} />
                </span>
                <p className="mt-3 font-mono text-[28px] font-bold text-ink">{s.value}</p>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* leaderboard */}
        <Reveal delay={200}>
          <div className="mt-12 rounded-[24px] border border-line bg-card p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Top 10</p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">This month's accuracy leaders</h3>
              </div>
              <span className="hidden rounded-full bg-paper px-3 py-1.5 font-mono text-[11px] font-semibold text-sub sm:block">
                Updated hourly
              </span>
            </div>

            <div className="mt-6 space-y-2.5">
              {LEADERBOARD.map((u) => (
                <div
                  key={u.rank}
                  className={`flex items-center gap-4 rounded-[14px] border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${
                    u.rank <= 3 ? "border-accent/20 bg-white" : "border-line bg-white"
                  }`}
                >
                  {/* rank */}
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[14px] font-bold ${
                    u.rank === 1 ? "bg-gradient-to-br from-amber to-orange text-white" :
                    u.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" :
                    u.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" :
                    "bg-paper text-faint"
                  }`}>
                    {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `#${u.rank}`}
                  </span>

                  {/* user */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/10 to-violet/10 text-[20px]">
                    {u.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-extrabold text-ink">{u.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] ${
                        u.plan === "enterprise" ? "bg-gradient-to-r from-accent to-violet text-white" :
                        u.plan === "pro" ? "bg-amber/15 text-amber" : "bg-paper text-sub"
                      }`}>
                        {u.plan}
                      </span>
                      <span className="font-mono text-[10.5px] text-faint">{u.sessions} sessions</span>
                    </div>
                  </div>

                  {/* stats */}
                  <div className="hidden text-right sm:block">
                    <p className="font-mono text-[10.5px] text-faint">streak</p>
                    <p className="font-mono text-[14px] font-bold text-ink">{u.streak} 🔥</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[10.5px] text-faint">accuracy</p>
                    <p className="font-mono text-[18px] font-bold text-mint">{u.accuracy}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* recent verdicts */}
        <Reveal delay={300}>
          <div className="mt-10 rounded-[24px] border border-line bg-card p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Live feed</p>
                <h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Recent public verdicts</h3>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-[#e9f9ef] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#1b7a41]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />
                Live
              </span>
            </div>

            <div className="mt-5 space-y-2.5">
              {RECENT_VERDICTS.map((v, i) => (
                <div key={i} className="flex items-center gap-4 rounded-[12px] border border-line bg-white p-4 transition-all duration-300 hover:shadow-soft">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent/10 to-violet/10 font-mono text-[13px] font-bold text-ink">
                    {v.ticker.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-extrabold text-ink">{v.ticker}</p>
                    <p className="font-mono text-[11px] text-faint">{v.user} · {v.time}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${
                    v.verdict === "BUY" ? "bg-[#e9f9ef] text-[#1b7a41]" :
                    v.verdict === "SELL" ? "bg-[#fdeceb] text-[#b3271e]" : "bg-paper text-sub"
                  }`}>
                    {v.verdict}
                  </span>
                  <div className="text-right">
                    <p className="font-mono text-[10.5px] text-faint">confidence</p>
                    <p className="font-mono text-[14px] font-bold text-ink">{v.confidence}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={400}>
          <div className="mt-12 rounded-[28px] bg-ink p-10 text-center text-white">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Think you can beat the top 10?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">
              Join 2,847 analysts already using Synapse Judgement. Get 50 free credits on signup.
            </p>
            <button
              onClick={onAuth}
              className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,255,255,0.25)]"
            >
              Join the court
              <Icon name="arrowUpRight" size={17} />
            </button>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
