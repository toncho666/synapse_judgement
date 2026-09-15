import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "./components/Icon";
import Reveal from "./components/Reveal";
import AgentPage from "./components/AgentPage";
import { useHashRoute } from "./lib/router";
import { useReducedMotion, useScrolled, useCountUp } from "./lib/hooks";
import { getUser, getSessions, getStats, logout, type User } from "./lib/auth";
import { AGENTS, JUDGE_PRICE, JUDGE_NAME, runAnalysis, fmtMoney, plural, type AgentId, type SessionResult, type Signal } from "./lib/engine";

type Stage = "idle" | "running" | "agents" | "verdict";

export default function App() {
  const reduced = useReducedMotion();
  const { route, nav } = useHashRoute();
  const routeKey = route.name === "agent" ? `agent-${route.id}` : route.name === "auth" ? "auth" : route.name === "dashboard" ? "dashboard" : route.name === "leaderboard" ? "leaderboard" : "home";

  const [ticker, setTicker] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [selected, setSelected] = useState<AgentId[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<SessionResult | null>(null);
  const [processed, setProcessed] = useState(0);
  const [orderCost, setOrderCost] = useState(0);
  const [orderJudge, setOrderJudge] = useState(0);
  const [errorNonce, setErrorNonce] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { setUser(getUser()); }, []);

  const routeRef = useRef(route);
  routeRef.current = route;
  const pendingScroll = useRef<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [routeKey]);

  useEffect(() => {
    if (routeKey === "home" && pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        });
      });
    }
  }, [routeKey, reduced]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (routeRef.current.name !== "agent") return;
      const el = e.target as HTMLElement;
      const a = el.closest?.("a[href^='#']");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#/")) return;
      e.preventDefault();
      pendingScroll.current = href.slice(1) || "top";
      window.location.hash = "/";
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const goHome = useCallback((section?: string) => {
    if (section) pendingScroll.current = section;
    nav({ name: "home" });
  }, [nav]);

  const judgeFree = selected.length > 1;
  const base = selected.reduce((s, id) => s + (AGENTS.find((a) => a.id === id)?.price ?? 0), 0);
  const judgeCost = selected.length === 0 ? 0 : judgeFree ? 0 : JUDGE_PRICE;
  const total = base + judgeCost;
  const validTicker = /^[A-Z.\-]{1,7}$/.test(ticker);

  const toggleAgent = (id: AgentId) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const scrollToResult = useCallback(() => {
    document.getElementById("result")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }, [reduced]);

  const launchInner = useCallback(() => {
    if (selected.length === 0) return;
    if (!validTicker) {
      setErrorNonce((v) => v + 1);
      setTimeout(() => document.getElementById("ticker-input")?.focus(), 60);
      document.getElementById("request")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      return;
    }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const res = runAnalysis(ticker, selected, Date.now() % 100000, portfolio.length > 0);
    setOrderCost(base);
    setOrderJudge(judgeCost);
    setResult(res);
    setStage("running");
    setProcessed(0);
    scrollToResult();

    const n = res.agents.length;
    if (reduced) {
      timers.current.push(setTimeout(() => { setProcessed(n); setStage("agents"); }, 500));
      return;
    }
    for (let i = 1; i <= n; i++) {
      timers.current.push(setTimeout(() => setProcessed(i), 400 + i * 700));
    }
    timers.current.push(setTimeout(() => setStage("agents"), 400 + n * 700 + 550));
  }, [selected, validTicker, ticker, portfolio, base, judgeCost, reduced, scrollToResult]);

  const launch = useCallback(() => {
    if (routeRef.current.name === "agent") {
      pendingScroll.current = validTicker ? null : "request";
      nav({ name: "home" });
      setTimeout(launchInner, 120);
      return;
    }
    launchInner();
  }, [launchInner, nav, validTicker]);

  const revealVerdict = useCallback(() => {
    setStage("verdict");
    if (!reduced) document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [reduced]);

  const newSession = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("idle");
    setResult(null);
    setProcessed(0);
  }, []);

  const totalCost = useMemo(() => orderCost + orderJudge, [orderCost, orderJudge]);

  const handleAuthSuccess = useCallback(() => {
    setUser(getUser());
    nav({ name: "dashboard" });
  }, [nav]);

  const handleLogout = useCallback(() => {
    setUser(null);
    nav({ name: "home" });
  }, [nav]);

  if (route.name === "auth") return <AuthPage onSuccess={handleAuthSuccess} onBack={goHome} />;
  if (route.name === "dashboard") return user ? <Dashboard user={user} onLogout={handleLogout} onHome={goHome} /> : <AuthPage onSuccess={handleAuthSuccess} onBack={goHome} />;
  if (route.name === "leaderboard") return <Leaderboard onBack={goHome} onAuth={() => nav({ name: "auth" })} />;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-ink">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.10),transparent_65%)]" />
        <div className="anim-drift2 absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.10),transparent_65%)]" />
        <div className="absolute bottom-[-18%] right-[8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,199,190,0.07),transparent_65%)]" />
      </div>

      <Nav user={user} onDashboard={() => nav({ name: "dashboard" })} onAuth={() => nav({ name: "auth" })} />

      {route.name === "agent" ? (
        <main className="relative z-10">
          <AgentPage agent={AGENTS.find((a) => a.id === route.id)!} selected={selected} onToggle={toggleAgent} goHome={goHome} />
        </main>
      ) : (
        <main className="relative z-10">
          <Hero />
          <div className="relative">
            <RequestSection ticker={ticker} onTicker={setTicker} portfolio={portfolio} onPortfolio={setPortfolio} selectedCount={selected.length} total={total} judgeFree={judgeFree} />
            {errorNonce > 0 && (
              <div key={errorNonce} className="anim-shake absolute inset-x-5 bottom-8 z-20 mx-auto max-w-xl md:inset-x-8">
                <p className="flex items-center gap-2.5 rounded-full border border-flame/30 bg-[#fff1f0] px-5 py-3 text-[13.5px] font-semibold text-[#b3271e] shadow-soft">
                  <Icon name="bolt" size={16} />Enter a ticker — for example, AAPL or NVDA.
                </p>
              </div>
            )}
          </div>
          <AgentStore selected={selected} onToggle={toggleAgent} />
          <Pipeline />
          <ResultsDashboard stage={stage} result={result} totalCost={totalCost} processed={processed} onRevealVerdict={revealVerdict} onNewSession={newSession} />
          <Transparency />
          <Faq />
          <section className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-[32px] bg-ink px-8 py-16 text-center text-white md:py-20">
                <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.4),transparent_70%)]" />
                <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.45),transparent_70%)]" />
                <h2 className="relative text-3xl font-extrabold tracking-tight md:text-5xl">The court is in session.</h2>
                <p className="relative mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/60">Five analysts. One verdict. Pick your team — and see what the Judge decides about {validTicker ? ticker : "your ticker"}.</p>
                <a href="#agents" className="relative mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,255,255,0.25)]">Build your team<Icon name="arrowDown" size={17} /></a>
              </div>
            </Reveal>
          </section>
        </main>
      )}

      <Footer />
      <StickyBar selected={selected} total={total} judgeFree={judgeFree} stage={stage} processed={processed} onRun={launch} onNewSession={newSession} />
      <div className="grain" aria-hidden="true" />
    </div>
  );
}

function Nav({ user, onDashboard, onAuth }: { user: User | null; onDashboard: () => void; onAuth: () => void }) {
  const scrolled = useScrolled(24);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-line bg-white/75 shadow-soft backdrop-blur-xl" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-violet transition-transform duration-300 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.4" fill="white" stroke="none" /><circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" /></svg>
          </span>
          <span className="leading-none">
            <span className="block text-[16px] font-extrabold tracking-tight text-ink">Synapse</span>
            <span className="block font-display text-[9px] font-semibold uppercase tracking-[0.28em] text-faint">Judgement</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {[{ href: "#agents", label: "Agents" }, { href: "#synthesis", label: "How it works" }, { href: "#result", label: "Dashboard" }, { href: "#pricing", label: "Pricing" }, { href: "#/leaderboard", label: "Leaderboard" }].map((l) => (
            <a key={l.href} href={l.href} className="group relative text-[14px] font-semibold text-sub transition-colors duration-300 hover:text-ink">{l.label}<span className="absolute -bottom-1 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-300 group-hover:w-full" /></a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-[12px] font-bold text-ink md:flex"><Icon name="spark" size={14} className="text-amber" />{user.credits} credits</div>
              <button onClick={onDashboard} className="flex items-center gap-2.5 rounded-full border border-line px-4 py-2 transition-all duration-300 hover:border-accent">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-[14px]">{user.avatar}</span>
                <span className="hidden text-[13px] font-bold text-ink md:inline">{user.name.split(' ')[0]}</span>
              </button>
            </>
          ) : (
            <button onClick={onAuth} className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-ink px-5 py-2.5 text-[14px] font-bold text-ink transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-accent hover:to-violet hover:text-white"><Icon name="judge" size={16} />Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setLoaded(true)); return () => cancelAnimationFrame(t); }, []);
  const TAPE = [["AAPL", "232.41", "+0.84%"], ["NVDA", "1042.10", "+2.31%"], ["MSFT", "468.22", "−0.35%"], ["TSLA", "244.60", "+1.12%"], ["AMZN", "186.90", "+0.48%"], ["GOOGL", "171.03", "−0.22%"], ["META", "512.44", "+1.87%"], ["S&P 500", "5472.10", "+0.41%"], ["NASDAQ", "17862.4", "+0.66%"], ["BTC", "64 230", "−1.24%"], ["ETH", "3 418", "+0.92%"], ["US 10Y", "4.21%", "+0.02"]] as const;
  const TapeRow = () => (<>{TAPE.map(([s, p, c]) => (<span key={s} className="flex items-center gap-2 whitespace-nowrap"><span className="font-semibold text-ink">{s}</span><span className="text-sub">{p}</span><span className={c.startsWith("+") ? "text-mint" : "text-flame"}>{c}</span></span>))}</>);
  const C = 280, R = 188;
  const nodes = AGENTS.map((a, i) => { const ang = ((-90 + i * 72) * Math.PI) / 180; return { ...a, x: C + R * Math.cos(ang), y: C + R * Math.sin(ang) }; });
  const pct = (v: number) => `${(v / 560) * 100}%`;
  return (
    <section className={loaded ? "is-loaded" : ""} id="top">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-40">
        <div>
          <div className="mask-line"><span><span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-sub"><span className="h-2 w-2 rounded-full bg-gradient-to-br from-accent to-violet" />AI investment analytics platform</span></span></div>
          <h1 className="mt-7 text-[clamp(38px,5.6vw,76px)] font-extrabold leading-[1.03] tracking-[-0.03em]">
            <span className="mask-line"><span style={{ transitionDelay: "120ms" }}>Investment council.</span></span>
            <span className="mask-line"><span style={{ transitionDelay: "260ms" }} className="relative inline-block">No compromises.<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 320 12" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9c60-6 200-8 314-4" stroke="url(#hg)" strokeWidth="4" strokeLinecap="round" /><defs><linearGradient id="hg" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#007AFF" /><stop offset="1" stopColor="#5856D6" /></linearGradient></defs></svg></span></span>
          </h1>
          <div className="mask-line mt-7"><span style={{ transitionDelay: "400ms" }}><p className="max-w-xl text-lg leading-relaxed text-sub md:text-xl"><strong className="font-bold text-ink">Pick your analysts. The Judge handles the rest.</strong> Six independent models break down the ticker in parallel — and argue with each other until a single verdict with reasoning is reached.</p></span></div>
          <div className="mask-line mt-9"><span style={{ transitionDelay: "520ms" }}><span className="flex flex-wrap items-center gap-4"><a href="#agents" className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-violet px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_32px_rgba(0,122,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,122,255,0.45)]">Build your team<Icon name="arrowDown" size={17} className="transition-transform duration-300 group-hover:translate-y-0.5" /></a><a href="#synthesis" className="group inline-flex items-center gap-2 text-[15px] font-bold text-accent transition-colors hover:text-violet">How the verdict is made<Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a></span></span></div>
          <div className="mask-line mt-12"><span style={{ transitionDelay: "640ms" }}><span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-faint"><span>~90 sec to a verdict</span><span className="h-1 w-1 rounded-full bg-line" /><span>10,400+ sources</span><span className="h-1 w-1 rounded-full bg-line" /><span>0 subscriptions</span></span></span></div>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[560px] select-none">
          <div className="anim-spin-slow absolute inset-[6.5%] rounded-full border border-dashed border-line" />
          <div className="absolute inset-[16%] rounded-full border border-line/70" />
          <div className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.16),rgba(0,122,255,0.05)_60%,transparent_72%)]" />
          <svg viewBox="0 0 560 560" className="absolute inset-0 h-full w-full">
            {nodes.map((n) => (<line key={`b-${n.id}`} x1={C} y1={C} x2={n.x} y2={n.y} stroke="#E8E8ED" strokeWidth="1.5" />))}
            {nodes.map((n, i) => (<line key={`p-${n.id}`} x1={C} y1={C} x2={n.x} y2={n.y} stroke={n.color} strokeWidth="2" strokeLinecap="round" opacity="0.65" className="anim-dash" style={{ animationDelay: `${i * 0.22}s` }} />))}
          </svg>
          {nodes.map((n, i) => (<div key={n.id} className="absolute" style={{ left: pct(n.x), top: pct(n.y) }}><div className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2" style={{ animation: `bobFloat 3.4s ease-in-out ${i * 0.35}s infinite alternate` }}><span className="flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-line bg-white shadow-soft transition-transform duration-300 hover:scale-110" style={{ color: n.color }}><Icon name={n.id} size={28} /></span><span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{n.short}</span></div></div>))}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"><div className="anim-halo-white flex h-[124px] w-[124px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-white shadow-[0_24px_60px_rgba(0,122,255,0.4)]"><Icon name="judge" size={46} strokeWidth={1.5} /></div><p className="mt-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">The Judge</p></div>
          <div className="absolute -right-2 top-[12%] hidden rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] font-medium text-sub shadow-soft sm:block">6 independent models</div>
          <div className="absolute -left-3 bottom-[16%] hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] font-medium text-sub shadow-soft sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-mint" />verdict in ~90 sec</div>
        </div>
      </div>
      <div className="overflow-hidden border-y border-line bg-card/70">
        <div className="anim-marquee flex w-max items-center gap-10 py-3.5 font-mono text-[13px]">
          <span className="flex items-center gap-10"><TapeRow /></span>
          <span aria-hidden="true" className="flex items-center gap-10"><TapeRow /></span>
        </div>
      </div>
    </section>
  );
}

function RequestSection({ ticker, onTicker, portfolio, onPortfolio, selectedCount, total, judgeFree }: { ticker: string; onTicker: (v: string) => void; portfolio: string; onPortfolio: (v: string) => void; selectedCount: number; total: number; judgeFree: boolean }) {
  return (
    <section id="request" className="relative mx-auto max-w-6xl scroll-mt-28 px-5 py-24 md:px-8 lg:py-32">
      <Reveal><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">01 · Your request</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">What are we judging today?</h2></Reveal>
      <Reveal delay={120}>
        <div className="mt-12 flex flex-col gap-12 lg:flex-row lg:items-start">
          <div className="flex-1">
            <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
              <div className="flex-1"><label className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-faint">Company ticker</label><input id="ticker-input" value={ticker} onChange={(e) => onTicker(e.target.value.toUpperCase().replace(/[^A-Z.\-]/g, "").slice(0, 7))} placeholder="AAPL" spellCheck={false} autoComplete="off" className="w-full border-b-2 border-line bg-transparent pb-3 pt-2 font-mono text-[30px] font-bold uppercase tracking-[0.06em] text-ink placeholder:font-sans placeholder:text-[24px] placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-faint/70 transition-colors duration-300 focus:border-accent md:text-[36px]" /></div>
              <div className="flex-1"><label className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-faint">Portfolio size <span className="normal-case tracking-normal text-faint/80">(optional)</span></label><input value={portfolio} onChange={(e) => onPortfolio(e.target.value.replace(/[^0-9.]/g, "").slice(0, 9))} placeholder="$100,000" inputMode="decimal" autoComplete="off" className="w-full border-b-2 border-line bg-transparent pb-3 pt-2 font-mono text-[30px] font-bold text-ink placeholder:font-sans placeholder:text-[24px] placeholder:font-medium placeholder:text-faint/70 transition-colors duration-300 focus:border-accent md:text-[36px]" /></div>
            </div>
            <p className="mt-5 flex flex-wrap items-center gap-2 text-[13.5px] text-faint"><Icon name="bolt" size={15} className="text-amber" />Quick start:<span className="flex flex-wrap gap-1.5">{["AAPL", "NVDA", "TSLA", "MSFT", "AMZN"].map((t) => (<button key={t} onClick={() => onTicker(t)} className={`rounded-full border px-3 py-1 font-mono text-[12px] font-semibold transition-all duration-300 ${ticker === t ? "border-accent bg-accent text-white" : "border-line bg-white text-sub hover:border-accent hover:text-accent"}`}>{t}</button>))}</span></p>
            <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-sub">Nothing else is required. No account, no questionnaire — the agents get to work the moment you press "Run analysis".</p>
          </div>
          <div className="w-full max-w-sm rounded-[24px] border border-line bg-card p-7 shadow-soft transition-all duration-300 hover:shadow-lift">
            <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-faint">Your order</p>
            <dl className="mt-4 space-y-2.5">
              <div className="flex items-baseline justify-between gap-4"><dt className="text-[14.5px] text-sub">{selectedCount > 0 ? `${selectedCount} ${plural(selectedCount, "agent", "agents")}` : "Agents"}</dt><dd className="font-mono text-[15px] font-semibold text-ink">{fmtMoney(total)}</dd></div>
              <div className="flex items-baseline justify-between gap-4"><dt className="text-[14.5px] text-sub">The Judge</dt><dd className={`font-mono text-[15px] font-semibold transition-colors duration-300 ${judgeFree ? "text-mint" : "text-ink"}`}>{judgeFree ? "free" : `+$${JUDGE_PRICE}`}</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4"><span className="text-[15px] font-bold text-ink">Total</span><span key={total} className="anim-fade-up font-mono text-[26px] font-bold text-ink">{fmtMoney(total)}</span></div>
            <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-faint"><Icon name="shield" size={15} className="mt-0.5 shrink-0 text-mint" />No account required. No subscription. The price is locked in before you pay.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function AgentStore({ selected, onToggle }: { selected: AgentId[]; onToggle: (id: AgentId) => void }) {
  const n = selected.length;
  const judgeFree = n > 1;
  return (
    <section id="agents" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">02 · Agent shop</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Assemble your council</h2></div><p className="max-w-sm text-[15px] leading-relaxed text-sub">Pay only for the analysts you need. The price updates instantly — before you run anything.</p></div></Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a, i) => {
          const on = selected.includes(a.id);
          return (
            <Reveal key={a.id} delay={i * 80}>
              <div role="button" tabIndex={0} aria-pressed={on} onClick={() => onToggle(a.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(a.id); } }} className={`group relative h-full cursor-pointer rounded-[24px] border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-accent ${on ? "border-transparent" : "border-line"}`} style={on ? { boxShadow: `0 0 0 1.5px ${a.color}, 0 18px 44px ${a.color}1f`, backgroundColor: `${a.color}0a` } : undefined}>
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[15px] transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: `${a.color}17`, color: a.color }}><Icon name={a.id} size={26} /></span>
                  <button role="switch" aria-checked={on} aria-label={`Agent "${a.name}"`} onClick={(e) => { e.stopPropagation(); onToggle(a.id); }} className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors duration-300 ${on ? "" : "bg-[#e9e9eb] hover:bg-[#dcdce0]"}`} style={on ? { backgroundColor: a.color } : undefined}><span className={`absolute left-0.5 top-0.5 h-7 w-7 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.3,1.2)] ${on ? "translate-x-5" : "translate-x-0"}`} /></button>
                </div>
                <h3 className="mt-5 text-[21px] font-extrabold tracking-tight">{a.name}</h3>
                <p className="mt-2 min-h-[66px] text-[14.5px] leading-relaxed text-sub">{a.desc}</p>
                <a href={`#/agent/${a.id}`} onClick={(e) => e.stopPropagation()} className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-accent transition-colors duration-300 hover:text-violet">Profile & sample report<Icon name="arrowUpRight" size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
                <div className="mt-4 flex flex-wrap gap-1.5">{a.tags.map((t) => (<span key={t} className="rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-faint">{t}</span>))}</div>
                <div className="mt-6 flex items-center justify-between border-t border-line pt-5"><p className="font-mono text-[16px] font-bold text-ink">${a.price}<span className="text-[12px] font-medium text-faint"> / analysis</span></p><span className={`flex items-center gap-1.5 font-mono text-[11.5px] font-semibold transition-colors duration-300 ${on ? "text-ink" : "text-faint"}`}><span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${on ? "bg-mint" : "bg-line"}`} />{on ? "in the order" : a.speed}</span></div>
              </div>
            </Reveal>
          );
        })}
        <Reveal delay={400}>
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-dashed border-line bg-white p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.12),transparent_70%)]" />
            <div><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet text-white"><Icon name="judge" size={26} /></span><span className="rounded-full bg-paper px-3 py-1 font-mono text-[11px] font-semibold text-sub">not for sale</span></div><h3 className="mt-5 text-[21px] font-extrabold tracking-tight">{JUDGE_NAME}</h3><p className="mt-2 text-[14.5px] leading-relaxed text-sub">The sixth agent isn't selected — it shows up on its own whenever briefs need to be merged into a single verdict.</p></div>
            <div className="mt-6 border-t border-line pt-5"><p className="font-mono text-[16px] font-bold text-ink">$0 <span className="text-[12px] font-medium text-faint">with 2+ agents</span><span className="ml-2 text-[12px] font-medium text-faint line-through">${JUDGE_PRICE}</span></p></div>
          </div>
        </Reveal>
      </div>
      <div className={`acc-body ${judgeFree ? "open" : ""} mt-6`}><div className="acc-inner"><div className="rounded-[22px] bg-gradient-to-r from-accent to-violet p-[1.5px] shadow-[0_16px_44px_rgba(0,122,255,0.22)]"><div className="flex flex-wrap items-center gap-4 rounded-[20.5px] bg-white px-6 py-5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-white"><Icon name="judge" size={22} /></span><div className="min-w-0 flex-1"><p className="font-bold text-ink">The Judge is connected — free</p><p className="text-[13.5px] text-sub">It will synthesize {n} {plural(n, "brief", "briefs")} into one verdict, with reasoning and a confidence score.</p></div><p className="font-mono text-[15px] font-bold"><span className="mr-2 text-faint line-through">${JUDGE_PRICE}</span><span className="text-mint">$0</span></p></div></div></div></div>
      <div className={`acc-body ${judgeFree ? "" : "open"} mt-6`}><div className="acc-inner"><div className="flex flex-wrap items-center gap-4 rounded-[22px] border border-dashed border-line bg-card px-6 py-5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-faint"><Icon name="lock" size={20} /></span><div className="min-w-0 flex-1"><p className="font-bold text-ink">{n === 0 ? "The Judge is waiting for a team" : "Add one more agent"}</p><p className="text-[13.5px] text-sub">With two or more agents, the Judge's synthesis is free. Selected {Math.min(n, 2)} of 2.</p></div><div className="flex items-center gap-1.5">{[0, 1].map((d) => (<span key={d} className={`h-2 w-2 rounded-full transition-colors duration-300 ${n > d ? "bg-accent" : "bg-line"}`} />))}<span className="ml-1 font-mono text-[11px] font-semibold text-faint">{Math.min(n, 2)}/2</span></div></div></div></div>
    </section>
  );
}

function Pipeline() {
  const STEPS = [{ n: "01", title: "The request", text: "A ticker and, optionally, your portfolio size. Nothing else required.", icon: "target" as const }, { n: "02", title: "Parallel breakdown", text: "The agents you picked work simultaneously and never see each other's briefs.", icon: "layers" as const }, { n: "03", title: "Weighted synthesis", text: "The Judge compares arguments, weights them by each agent's confidence, and records who dissented.", icon: "judge" as const }, { n: "04", title: "A verdict with reasoning", text: "BUY / HOLD / SELL, a 0–100 confidence score and written reasoning.", icon: "gauge" as const }];
  return (
    <section id="synthesis" className="relative border-y border-line bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:py-32">
        <div className="lg:sticky lg:top-32 lg:self-start"><Reveal><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">03 · How it works</p><h2 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] md:text-5xl">One verdict.<br />Five independent minds.</h2><p className="mt-6 max-w-md text-[16px] leading-relaxed text-sub">We don't average opinions or make the models "agree". The agents argue — the Judge weighs the arguments and delivers a decision it can account for, word by word.</p><div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[12.5px] text-faint"><span><strong className="text-ink">0</strong> shared context between agents</span><span><strong className="text-ink">100%</strong> of arguments in the reasoning</span><span><strong className="text-ink">1</strong> final decision</span></div></Reveal></div>
        <ol className="relative space-y-5"><span className="absolute bottom-8 left-[27px] top-8 w-px bg-gradient-to-b from-accent via-violet to-line" aria-hidden="true" />{STEPS.map((s, i) => (<Reveal key={s.n} delay={i * 110} as="li"><div className="group relative flex gap-5 rounded-[22px] border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift md:p-7"><span className="relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink shadow-soft transition-colors duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-accent group-hover:to-violet group-hover:text-white"><Icon name={s.icon} size={24} /></span><div><p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-faint">STEP {s.n}</p><h3 className="mt-1.5 text-xl font-extrabold tracking-tight">{s.title}</h3><p className="mt-2 text-[14.5px] leading-relaxed text-sub">{s.text}</p></div></div></Reveal>))}</ol>
      </div>
    </section>
  );
}

function ResultsDashboard({ stage, result, totalCost, processed, onRevealVerdict, onNewSession }: { stage: Stage; result: SessionResult | null; totalCost: number; processed: number; onRevealVerdict: () => void; onNewSession: () => void }) {
  const n = result?.agents.length ?? 0;
  const conf = useCountUp(result?.verdictConfidence ?? 0, stage === "verdict", 1400);
  const done = stage === "agents" || stage === "verdict";
  const SIGNAL_META: Record<Signal, { label: string; cls: string; dot: string }> = { bull: { label: "Bullish signal", cls: "bg-[#e9f9ef] text-[#1b7a41]", dot: "bg-mint" }, bear: { label: "Bearish signal", cls: "bg-[#fdeceb] text-[#b3271e]", dot: "bg-flame" }, flat: { label: "Neutral", cls: "bg-paper text-sub", dot: "bg-faint" } };
  const VERDICT_COLOR = { BUY: "#30d158", SELL: "#ff453a", HOLD: "#ff9f0a" } as const;
  const defOf = (id: string) => AGENTS.find((a) => a.id === id)!;
  return (
    <section id="result" className="relative mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">04 · Session protocol</p><h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">The result</h2></div><p className="max-w-sm text-[15px] leading-relaxed text-sub">A feed of every analyst's brief — with the Judge's decision on top.</p></div></Reveal>
      {!result ? (
        <Reveal delay={120}><div className="mt-12 rounded-[28px] border-2 border-dashed border-line bg-card/50 px-8 py-20 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-paper text-faint"><Icon name="gauge" size={30} /></span><h3 className="mt-6 text-2xl font-extrabold tracking-tight">The dashboard assembles here</h3><p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-sub">Pick your agents, enter a ticker and press "Run analysis".</p><p className="mt-6 font-mono text-[12px] uppercase tracking-[0.2em] text-faint">session · awaiting request</p></div></Reveal>
      ) : (
        <div className="mt-12 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="rounded-[28px] border border-line bg-card shadow-soft">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-7 py-6"><div><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">session {result.session} · {result.agents.length} {plural(result.agents.length, "agent", "agents")} · {fmtMoney(totalCost)}</p><p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight text-ink">{result.ticker}</p></div><div className="text-right font-mono text-[13px]"><p className="text-faint">last price</p><p className="text-lg font-bold text-ink">${result.basePrice.toFixed(2)}</p></div></header>
            <div>{result.agents.map((v, idx) => { const def = defOf(v.agentId); const meta = SIGNAL_META[v.signal]; const isDone = done || idx < processed; const isCurrent = stage === "running" && idx === processed; return (<article key={v.agentId} className={`border-b border-line px-7 py-6 last:border-b-0 ${isCurrent ? "bg-white" : ""}`}><div className="flex flex-wrap items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: `${def.color}17`, color: def.color }}><Icon name={def.id} size={20} /></span><div className="min-w-0 flex-1"><h3 className="text-[15.5px] font-extrabold">{def.name}</h3><p className="font-mono text-[11px] text-faint">confidence {v.confidence}%</p></div>{isDone ? (<span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11.5px] font-semibold ${meta.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>) : (<span className="flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 font-mono text-[11.5px] font-semibold text-faint">{isCurrent ? (<>analyzing<span className="flex gap-0.5"><span className="dot-blink h-1 w-1 rounded-full bg-current" /><span className="dot-blink h-1 w-1 rounded-full bg-current" /><span className="dot-blink h-1 w-1 rounded-full bg-current" /></span></>) : ("queued")}</span>)}</div>{isDone ? (<div className="anim-fade-up mt-4"><ul className="space-y-2">{v.lines.map((l, i) => (<li key={i} className="flex gap-2.5 text-[14.5px] leading-relaxed text-ink/90"><span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: def.color }} />{l}</li>))}</ul><div className="mt-4 flex flex-wrap gap-2">{v.metrics.map((m) => (<span key={m.label} className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-mono text-[11.5px]"><span className="text-faint">{m.label}</span> <span className="font-semibold text-ink">{m.value}</span></span>))}</div></div>) : (<div className="mt-4 space-y-2.5"><div className="shimmer h-3.5 w-[92%] rounded-md" /><div className="shimmer h-3.5 w-[78%] rounded-md" /><div className="shimmer h-3.5 w-[56%] rounded-md" /></div>)}</article>); })}</div>
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 text-white shadow-[0_32px_80px_rgba(29,29,31,0.35)]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.5),transparent_70%)]" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.35),transparent_70%)]" />
              <header className="relative flex items-center gap-3.5"><span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet"><Icon name="judge" size={24} /></span><div><h3 className="text-lg font-extrabold tracking-tight">{JUDGE_NAME}</h3><p className="font-mono text-[11px] text-white/50">synthesis of {result.agents.length} {plural(result.agents.length, "brief", "briefs")} · weight = confidence</p></div></header>
              {stage === "running" && (<div className="relative mt-9"><p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">awaiting briefs</p><p className="mt-3 text-2xl font-extrabold">Agents are working<span className="dot-blink">.</span><span className="dot-blink">.</span><span className="dot-blink">.</span></p><p className="mt-2 font-mono text-[13px] text-white/60">{Math.min(processed, n)} / {n} briefs ready</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-500" style={{ width: `${(Math.min(processed, n) / Math.max(1, n)) * 100}%` }} /></div></div>)}
              {stage === "agents" && (<div className="anim-fade-up relative mt-9 text-center"><p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/50">verdict ready</p><p className="mx-auto mt-3 max-w-[300px] text-[15px] leading-relaxed text-white/70">All briefs are in. The Judge has weighed the arguments and is ready to deliver.</p><button onClick={onRevealVerdict} className="anim-halo-white mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-4 text-[15px] font-extrabold text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-95"><Icon name="judge" size={18} />Get the verdict</button></div>)}
              {stage === "verdict" && (<div className="anim-verdict relative mt-8"><div className="text-center"><p className="font-display text-[52px] font-bold leading-none tracking-tight md:text-[62px]" style={{ color: VERDICT_COLOR[result.verdict], textShadow: `0 0 44px ${VERDICT_COLOR[result.verdict]}55` }}>{result.verdict}</p><p className="mt-2.5 text-[15px] font-semibold text-white/60">{result.verdictWord} · {result.ticker}</p></div><div className="mt-8"><div className="flex items-end justify-between font-mono text-[12px] text-white/50"><span>confidence</span><span className="text-[22px] font-bold text-white">{conf}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-accent to-violet transition-[width] duration-[1400ms] ease-out" style={{ width: stage === "verdict" ? `${conf}%` : "0%" }} /></div></div><div className="mt-7 grid grid-cols-2 gap-3 font-mono text-[12.5px]"><div className="rounded-[14px] bg-white/[0.06] px-4 py-3.5"><p className="text-white/45">target price</p><p className="mt-1 text-[16px] font-bold text-white">${result.target.toFixed(2)}</p></div><div className="rounded-[14px] bg-white/[0.06] px-4 py-3.5"><p className="text-white/45">upside</p><p className="mt-1 text-[16px] font-bold" style={{ color: result.target >= result.basePrice ? "#30d158" : "#ff453a" }}>{result.target >= result.basePrice ? "+" : ""}{(((result.target - result.basePrice) / result.basePrice) * 100).toFixed(1)}%</p></div></div><div className="mt-6"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">vote split</p><div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-white/10">{result.consensus.bull > 0 && (<span className="h-full bg-mint" style={{ width: `${(result.consensus.bull / n) * 100}%` }} />)}{result.consensus.flat > 0 && (<span className="h-full bg-white/30" style={{ width: `${(result.consensus.flat / n) * 100}%` }} />)}{result.consensus.bear > 0 && (<span className="h-full bg-flame" style={{ width: `${(result.consensus.bear / n) * 100}%` }} />)}</div><div className="mt-2.5 flex gap-5 font-mono text-[11.5px] text-white/55"><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-mint" />for — {result.consensus.bull}</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-white/40" />neutral — {result.consensus.flat}</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-flame" />against — {result.consensus.bear}</span></div></div><div className="mt-6 border-t border-white/10 pt-6"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">reasoning</p><ul className="mt-3 space-y-2.5">{result.rationale.map((r, i) => (<li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-white/80"><Icon name="spark" size={14} className="mt-1 shrink-0" style={{ color: "#8f8df0" }} />{r}</li>))}</ul></div><button onClick={onNewSession} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 py-3.5 text-[14px] font-bold text-white/85 transition-all duration-300 hover:border-white/50 hover:bg-white/5"><Icon name="refresh" size={16} />New session</button><p className="mt-4 text-center text-[11px] leading-relaxed text-white/35">The verdict is an analytical synthesis, not individual investment advice.</p></div>)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function StickyBar({ selected, total, judgeFree, stage, processed, onRun, onNewSession }: { selected: AgentId[]; total: number; judgeFree: boolean; stage: Stage; processed: number; onRun: () => void; onNewSession: () => void }) {
  const past = useScrolled(640);
  const count = selected.length;
  const active = count > 0 && stage === "idle";
  const chosen = AGENTS.filter((a) => selected.includes(a.id));
  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-out ${past ? "translate-y-0" : "translate-y-[115%]"}`}>
      <div className="mx-auto mb-4 max-w-6xl px-4 md:px-8">
        <div className="flex items-center gap-4 overflow-hidden rounded-full border border-line bg-white/90 p-2 pl-5 shadow-bar backdrop-blur-xl md:gap-5 md:pl-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
            <div className="hidden sm:flex">{count === 0 ? (<span className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-line text-faint"><Icon name="plus" size={18} /></span>) : (<div className="flex -space-x-2.5">{chosen.map((a) => (<span key={a.id} title={a.name} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-soft" style={{ backgroundColor: `${a.color}17`, color: a.color }}><Icon name={a.id} size={19} /></span>))}</div>)}</div>
            <div className="min-w-0"><p className="truncate text-[12px] font-bold uppercase tracking-[0.14em] text-faint">{stage === "running" ? "Analysis running" : stage !== "idle" ? "Session complete" : "Your order"}</p>{stage === "running" ? (<p className="truncate font-mono text-[13.5px] font-semibold text-ink">{processed}/{count} agents ready…</p>) : stage !== "idle" ? (<a href="#result" className="truncate font-mono text-[13.5px] font-semibold text-accent hover:text-violet">Verdict ready — open the dashboard ↓</a>) : count === 0 ? (<p className="truncate text-[13.5px] text-sub">No agents selected — flip a switch above</p>) : (<p className="truncate font-mono text-[13.5px] text-sub">{count} {count > 1 ? "agents" : "agent"} · The Judge {judgeFree ? <span className="font-semibold text-mint">free</span> : `+$${JUDGE_PRICE}`}</p>)}</div>
          </div>
          <div className="shrink-0 text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-faint">Total</p><p key={total} className="anim-fade-up font-mono text-[20px] font-bold leading-tight text-ink md:text-[22px]">{fmtMoney(total)}</p></div>
          {stage === "running" ? (<button disabled className="flex shrink-0 cursor-wait items-center gap-2.5 rounded-full bg-ink px-6 py-3.5 font-bold text-white md:px-7"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="animate-spin" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" /><path d="M21 12a9 9 0 0 0-9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg><span className="hidden sm:inline">Working…</span></button>) : stage !== "idle" ? (<button onClick={() => { onNewSession(); document.getElementById("agents")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="shrink-0 rounded-full border-2 border-ink px-6 py-3 font-bold text-ink transition-all duration-300 hover:bg-ink hover:text-white md:px-7">New session</button>) : (<button onClick={onRun} disabled={!active} className={`shrink-0 rounded-full px-6 py-3.5 font-bold transition-all duration-300 md:px-7 ${active ? "anim-halo bg-gradient-to-r from-accent to-violet text-white hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,122,255,0.45)]" : "cursor-not-allowed bg-ink/10 text-ink/35"}`}>Run analysis</button>)}
        </div>
      </div>
    </div>
  );
}

function Transparency() {
  const GUARANTEES = [{ title: "Total shown before you pay", text: "The order total is locked in the bottom bar the moment you flip a switch." }, { title: "Pay per session", text: "No subscriptions, no renewals, no default charges. One ticker — one price." }, { title: "The Judge is $0 with 2+ agents", text: "Synthesis and reasoning are included in the team price." }, { title: "No sign-up before the result", text: "Email and card are only requested after you've seen the price." }];
  return (
    <section id="pricing" className="relative border-t border-line bg-card/60">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-24 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:py-32">
        <div><Reveal><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">05 · Transparency</p><h2 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.02em] md:text-5xl">The price is known<br />before launch. Always.</h2><p className="mt-6 max-w-md text-[16px] leading-relaxed text-sub">We deliberately never hide the cost behind a "Contact us" button.</p></Reveal><ul className="mt-10 space-y-4">{GUARANTEES.map((g, i) => (<Reveal key={g.title} delay={i * 90} as="li"><div className="group flex gap-4 rounded-[18px] border border-transparent bg-white/0 p-4 transition-all duration-300 hover:border-line hover:bg-white hover:shadow-soft"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e9f9ef] text-[#1b7a41] transition-transform duration-300 group-hover:scale-110"><Icon name="check" size={16} strokeWidth={2} /></span><div><h3 className="text-[16px] font-extrabold">{g.title}</h3><p className="mt-1 text-[14px] leading-relaxed text-sub">{g.text}</p></div></div></Reveal>))}</ul></div>
        <Reveal delay={150}><div className="relative mx-auto w-full max-w-[400px] rotate-[1.6deg] transition-transform duration-500 hover:rotate-0"><span className="absolute -right-3 -top-5 z-10 rotate-[10deg] rounded-full border-2 border-mint px-3.5 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#1b7a41]">no hidden charges</span><div className="rounded-[20px] border border-line bg-white p-7 font-mono shadow-lift md:p-8"><p className="text-center text-[13px] font-bold tracking-[0.18em] text-ink">SYNAPSE JUDGEMENT</p><p className="mt-1 text-center text-[11px] text-faint">order #SN-2481 · NVDA · 14:32 UTC</p><div className="my-5 border-t border-dashed border-line" /><dl className="space-y-2.5 text-[13px]">{[["Technical", "$5"], ["Fundamental", "$7"], ["Earning Calls", "$8"]].map(([k, v]) => (<div key={k} className="flex items-baseline justify-between gap-3"><dt className="text-ink/85">{k}</dt><dd className="text-faint">·</dd><dd className="font-semibold text-ink">{v}</dd></div>))}<div className="flex items-baseline justify-between gap-3"><dt className="text-ink/85">The Judge</dt><dd className="text-faint">·</dd><dd className="font-semibold text-[#1b7a41]">$0 <span className="text-[11px] font-normal text-faint line-through">$15</span></dd></div></dl><div className="my-5 border-t border-dashed border-line" /><div className="flex items-baseline justify-between text-[15px]"><span className="font-bold text-ink">TOTAL</span><span className="font-bold text-ink">$20</span></div><p className="mt-1.5 text-[10.5px] leading-relaxed text-faint">Charged after you confirm the price. Verdict and reasoning included.</p></div></div></Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ITEMS = [{ q: "How fast is the verdict?", a: "A full session takes about 90 seconds." }, { q: "Why is the Judge free with two agents?", a: "A single opinion doesn't need an arbiter." }, { q: "Do I need to register or add a card?", a: "No. You can assemble the order and see the exact total without an account." }, { q: "Is this investment advice?", a: "No. The verdict is an analytical synthesis." }, { q: "Can the agents see each other's briefs?", a: "No. Agents run in isolation and never share context." }, { q: "What if I pick only one agent?", a: "You still get its full brief. The Judge's work is added at $15." }];
  return (
    <section id="faq" className="mx-auto max-w-6xl px-5 py-24 md:px-8 lg:py-32">
      <Reveal><p className="font-mono text-[12px] font-semibold uppercase tracking-[0.24em] text-accent">06 · FAQ</p><h2 className="mt-3 max-w-xl text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Questions the Judge gets asked most</h2></Reveal>
      <div className="mt-12 grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal delay={100}><div className="lg:sticky lg:top-32"><p className="max-w-sm text-[16px] leading-relaxed text-sub">Everything about pricing, the verdict and what happens behind the scenes.</p><a href="mailto:court@synapse.jdg" className="group mt-6 inline-flex items-center gap-2 text-[15px] font-bold text-accent transition-colors hover:text-violet">Something else? Write to the court<Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a></div></Reveal>
        <div className="space-y-3">{ITEMS.map((item, i) => { const isOpen = open === i; return (<Reveal key={item.q} delay={i * 70}><div className={`rounded-[20px] border transition-all duration-300 ${isOpen ? "border-line bg-white shadow-soft" : "border-line bg-card hover:border-faint/60"}`}><button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"><span className="text-[16.5px] font-extrabold tracking-tight">{item.q}</span><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line transition-all duration-300 ${isOpen ? "rotate-45 border-accent bg-accent text-white" : "text-faint"}`}><Icon name="plus" size={15} /></span></button><div className={`acc-body ${isOpen ? "open" : ""}`}><div className="acc-inner"><p className="px-6 pb-6 text-[14.5px] leading-relaxed text-sub">{item.a}</p></div></div></div></Reveal>); })}</div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink pb-36 pt-16 text-white/60 md:pt-20">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div><a href="#top" className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gradient-to-br from-accent to-violet"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.4" fill="white" stroke="none" /><circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" /></svg></span><span className="leading-none"><span className="block text-[16px] font-extrabold tracking-tight text-white">Synapse</span><span className="block font-display text-[9px] font-semibold uppercase tracking-[0.28em] text-white/50">Judgement</span></span></a><p className="mt-5 max-w-xs text-[14px] leading-relaxed">An investment council of six agents. Pick your analysts — the Judge handles the rest.</p></div>
          {[{ title: "Product", links: [["Agent shop", "#agents"], ["How synthesis works", "#synthesis"], ["Verdict dashboard", "#result"], ["Pricing", "#pricing"]] }, { title: "Company", links: [["Back to top", "#top"], ["FAQ", "#faq"], ["Team", "mailto:team@synapse.jdg"]] }, { title: "Legal", links: [["Disclaimer", "#faq"], ["Terms of service", "#faq"], ["Privacy", "#faq"]] }].map((col) => (<div key={col.title}><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">{col.title}</p><ul className="mt-4 space-y-2.5">{col.links.map(([label, href]) => (<li key={label}><a href={href} className="text-[14px] text-white/60 transition-colors duration-300 hover:text-white">{label}</a></li>))}</ul></div>))}
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 font-mono text-[11.5px] text-white/35 md:flex-row md:items-center md:justify-between"><p>© 2026 Synapse Judgement. All verdicts are analytics, not investment advice.</p><p>10,400+ sources · 6 agents · 1 verdict</p></div>
      </div>
    </footer>
  );
}

function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("demo@synapse.ai");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setTimeout(() => { onSuccess(); setLoading(false); }, 800); };
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true"><div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.10),transparent_65%)]" /><div className="anim-drift2 absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.10),transparent_65%)]" /></div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16 md:px-8">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-[14px] font-semibold text-sub transition-colors hover:text-ink"><Icon name="arrowDown" size={15} className="rotate-90" />Back to home</button>
          <div className="mb-10 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-gradient-to-br from-accent to-violet"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.4" fill="white" stroke="none" /><circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" /></svg></span><div><p className="text-[20px] font-extrabold tracking-tight text-ink">Synapse Judgement</p><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">AI Investment Council</p></div></div>
          <div className="mb-8 flex gap-1 rounded-full bg-card p-1"><button onClick={() => setMode("login")} className={`flex-1 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all duration-300 ${mode === "login" ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"}`}>Sign in</button><button onClick={() => setMode("register")} className={`flex-1 rounded-full px-5 py-2.5 text-[14px] font-bold transition-all duration-300 ${mode === "register" ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"}`}>Create account</button></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "register" && (<div><label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Full name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent" /></div>)}
            <div><label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent" /></div>
            <div><label className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-[12px] border-2 border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink transition-colors duration-300 focus:border-accent" /></div>
            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-violet px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_32px_rgba(0,122,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{loading ? "Processing…" : (mode === "login" ? "Sign in" : "Create account")}</button>
          </form>
          {mode === "login" && (<div className="mt-6 rounded-[14px] border border-dashed border-line bg-card/60 px-5 py-4"><p className="flex items-center gap-2 text-[13px] font-bold text-ink"><Icon name="spark" size={15} className="text-amber" />Demo credentials pre-filled</p><p className="mt-1.5 text-[12.5px] leading-relaxed text-sub">Just click "Sign in" to explore the dashboard.</p></div>)}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout, onHome }: { user: User; onLogout: () => void; onHome: () => void }) {
  const [tab, setTab] = useState<"overview" | "history" | "achievements" | "billing">("overview");
  const sessions = getSessions();
  const stats = getStats();
  const userAchievements = user.achievements || [];
  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true"><div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08),transparent_65%)]" /></div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <button onClick={onHome} className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-accent to-violet"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.4" fill="white" stroke="none" /><circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" /></svg></span><span className="leading-none"><span className="block text-[17px] font-extrabold tracking-tight text-ink">Synapse</span><span className="block font-display text-[8.5px] font-semibold uppercase tracking-[0.26em] text-faint">Judgement</span></span></button>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 font-mono text-[12px] font-bold text-ink md:flex"><Icon name="spark" size={14} className="text-amber" />{user.credits} credits</div>
            <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-[18px]">{user.avatar}</span><div className="hidden md:block"><p className="text-[13px] font-bold text-ink">{user.name}</p><p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">{user.plan} plan</p></div></div>
            <button onClick={() => { logout(); onLogout(); }} className="rounded-full border border-line px-4 py-2 text-[13px] font-bold text-sub transition-all duration-300 hover:border-flame hover:text-flame">Sign out</button>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="mb-10"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Dashboard</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Welcome back, {user.name.split(' ')[0]}.</h1><p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-sub">Here's your analytics overview, session history and everything about your council.</p></div>
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-full bg-card p-1">{(["overview", "history", "achievements", "billing"] as const).map((t) => (<button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[13.5px] font-bold capitalize transition-all duration-300 ${tab === t ? "bg-white text-ink shadow-soft" : "text-sub hover:text-ink"}`}>{t === "billing" ? "Plan & Billing" : t}</button>))}</div>
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Total sessions", value: stats.totalSessions, icon: "layers", color: "#007AFF" }, { label: "Total spent", value: "$" + stats.totalSpent, icon: "bolt", color: "#FF9500" }, { label: "Avg confidence", value: stats.avgConfidence + "%", icon: "gauge", color: "#5856D6" }, { label: "Avg accuracy", value: stats.avgAccuracy + "%", icon: "target", color: "#34c759" }].map((s) => (<div key={s.label} className="rounded-[20px] border border-line bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"><div className="flex items-center justify-between"><span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{s.label}</span><span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ backgroundColor: `${s.color}17`, color: s.color }}><Icon name={s.icon as any} size={18} /></span></div><p className="mt-4 font-mono text-[32px] font-bold text-ink">{s.value}</p></div>))}</div>
            <div className="rounded-[24px] border border-line bg-card p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Recent activity</p><h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Latest sessions</h3></div><button onClick={() => setTab("history")} className="text-[13px] font-bold text-accent hover:text-violet">View all →</button></div><div className="mt-5 space-y-3">{sessions.slice(0, 3).map((s: any) => (<div key={s.id} className="rounded-[16px] border border-line bg-white p-5 transition-all duration-300 hover:shadow-soft"><div className="flex flex-wrap items-center gap-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-accent/10 to-violet/10 font-mono text-[15px] font-bold text-ink">{s.ticker.slice(0, 2)}</span><div><p className="text-[15px] font-extrabold">{s.ticker}</p><p className="font-mono text-[11px] text-faint">{new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div></div><div className="flex flex-wrap items-center gap-1.5">{s.agents.map((a: any) => (<span key={a} className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10.5px] font-semibold text-sub">{a}</span>))}</div><div className="ml-auto flex items-center gap-4"><span className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${s.verdict === "BUY" ? "bg-[#e9f9ef] text-[#1b7a41]" : s.verdict === "SELL" ? "bg-[#fdeceb] text-[#b3271e]" : "bg-paper text-sub"}`}>{s.verdict}</span><div className="text-right"><p className="font-mono text-[11px] text-faint">confidence</p><p className="font-mono text-[15px] font-bold text-ink">{s.confidence}%</p></div></div></div></div>))}</div></div>
            <div className="relative overflow-hidden rounded-[28px] bg-ink p-8 text-white md:p-10"><div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.4),transparent_70%)]" /><div className="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.4),transparent_70%)]" /><div className="relative"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">Referral program</p><h3 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Invite friends. Earn credits.</h3><p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/60">Share your code — both you and your friend get 25 credits when they make their first analysis.</p><div className="mt-6 flex flex-wrap items-center gap-3"><div className="flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 font-mono text-[15px] font-bold"><Icon name="spark" size={16} className="text-amber" />{user.referralCode}</div><button onClick={() => navigator.clipboard?.writeText(user.referralCode)} className="rounded-full bg-white px-6 py-3 text-[14px] font-bold text-ink transition-all duration-300 hover:scale-[1.03]">Copy code</button></div></div></div>
          </div>
        )}
        {tab === "history" && (<div className="rounded-[24px] border border-line bg-card p-7"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Session history</p><h3 className="mt-1.5 text-xl font-extrabold tracking-tight">All your analyses</h3><div className="mt-6 space-y-3">{sessions.length === 0 ? (<p className="py-12 text-center text-[14px] text-sub">No sessions yet.</p>) : (sessions.map((s: any) => (<div key={s.id} className="rounded-[16px] border border-line bg-white p-6 transition-all duration-300 hover:shadow-soft"><div className="flex flex-wrap items-center gap-4"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-accent/10 to-violet/10 font-mono text-[15px] font-bold text-ink">{s.ticker.slice(0, 2)}</span><div><p className="text-[15px] font-extrabold">{s.ticker}</p><p className="font-mono text-[11px] text-faint">{new Date(s.timestamp).toLocaleString("en-US")}</p></div></div><div className="flex flex-wrap items-center gap-1.5">{s.agents.map((a: any) => (<span key={a} className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10.5px] font-semibold text-sub">{a}</span>))}</div><div className="ml-auto flex items-center gap-4"><span className={`rounded-full px-3 py-1 font-mono text-[11px] font-bold ${s.verdict === "BUY" ? "bg-[#e9f9ef] text-[#1b7a41]" : s.verdict === "SELL" ? "bg-[#fdeceb] text-[#b3271e]" : "bg-paper text-sub"}`}>{s.verdict}</span><div className="text-right"><p className="font-mono text-[11px] text-faint">confidence</p><p className="font-mono text-[15px] font-bold text-ink">{s.confidence}%</p></div></div></div><div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 font-mono text-[12px]"><span className="text-sub">Target: <strong className="text-ink">${s.targetPrice.toFixed(2)}</strong></span><span className="text-sub">Current: <strong className="text-ink">${s.currentPrice.toFixed(2)}</strong></span><span className={((s.targetPrice - s.currentPrice) / s.currentPrice * 100) >= 0 ? "text-mint" : "text-flame"}>Upside: <strong>{((s.targetPrice - s.currentPrice) / s.currentPrice * 100) >= 0 ? "+" : ""}{((s.targetPrice - s.currentPrice) / s.currentPrice * 100).toFixed(1)}%</strong></span><span className="text-sub">Cost: <strong className="text-ink">${s.cost}</strong></span></div></div>)))}</div></div>)}
        {tab === "achievements" && (<div className="rounded-[24px] border border-line bg-card p-7"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Achievements</p><h3 className="mt-1.5 text-xl font-extrabold tracking-tight">Your milestones</h3><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{userAchievements.length === 0 ? (<p className="col-span-full py-12 text-center text-[14px] text-sub">No achievements yet.</p>) : (userAchievements.map((a: any) => (<div key={a.id} className="rounded-[18px] border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"><span className="text-[36px]">{a.icon}</span><h4 className="mt-3 text-[15px] font-extrabold">{a.title}</h4><p className="mt-1 text-[13px] leading-relaxed text-sub">{a.description}</p>{a.unlockedAt && (<p className="mt-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-mint">✓ Unlocked</p>)}{a.progress !== undefined && a.maxProgress !== undefined && (<div className="mt-3"><div className="h-1.5 overflow-hidden rounded-full bg-paper"><div className="h-full rounded-full bg-gradient-to-r from-accent to-violet" style={{ width: `${Math.min(100, (a.progress / a.maxProgress) * 100)}%` }} /></div><p className="mt-1.5 font-mono text-[10.5px] font-semibold text-faint">{a.progress}/{a.maxProgress}</p></div>)}</div>)))}</div></div>)}
        {tab === "billing" && (<div className="space-y-8"><div className="rounded-[24px] border border-line bg-card p-7"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Current plan</p><div className="mt-3 flex items-center gap-4"><span className={`rounded-full px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.14em] ${user.plan === 'enterprise' ? 'bg-gradient-to-r from-accent to-violet text-white' : user.plan === 'pro' ? 'bg-amber/15 text-amber' : 'bg-paper text-sub'}`}>{user.plan}</span><span className="font-mono text-[14px] font-bold text-ink">{user.credits} credits remaining</span></div></div><div className="grid gap-5 md:grid-cols-3">{[{ name: "Free", price: "$0", desc: "Try the platform", features: ["50 credits on signup", "All 5 agents", "Basic verdicts"], current: user.plan === 'free', cta: "Current plan", disabled: true }, { name: "Pro", price: "$29", period: "/month", desc: "For active traders", features: ["500 credits/month", "Priority processing", "API access"], current: user.plan === 'pro', cta: user.plan === 'pro' ? "Current plan" : "Upgrade to Pro", highlight: true, disabled: user.plan === 'pro' }, { name: "Enterprise", price: "$99", period: "/month", desc: "For teams & funds", features: ["2000 credits/month", "Custom agents", "White-label reports"], current: user.plan === 'enterprise', cta: user.plan === 'enterprise' ? "Current plan" : "Upgrade to Enterprise", disabled: user.plan === 'enterprise' }].map((plan: any) => (<div key={plan.name} className={`relative rounded-[24px] border p-7 transition-all duration-300 ${plan.highlight ? "border-accent bg-gradient-to-b from-[#f0f7ff] to-white shadow-lift" : "border-line bg-card hover:-translate-y-1 hover:shadow-soft"}`}>{plan.highlight && (<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent to-violet px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white">Most popular</span>)}<h3 className="text-[18px] font-extrabold">{plan.name}</h3><p className="mt-1 text-[13px] text-sub">{plan.desc}</p><div className="mt-5 flex items-baseline gap-1"><span className="font-mono text-[38px] font-bold text-ink">{plan.price}</span>{plan.period && (<span className="text-[13px] text-faint">{plan.period}</span>)}</div><ul className="mt-5 space-y-2.5">{plan.features.map((f: string) => (<li key={f} className="flex items-center gap-2 text-[13.5px] text-sub"><Icon name="check" size={14} className="shrink-0 text-mint" />{f}</li>))}</ul><button disabled={plan.disabled} className={`mt-7 w-full rounded-full py-3 text-[14px] font-bold transition-all duration-300 ${plan.disabled ? "cursor-not-allowed bg-paper text-faint" : plan.highlight ? "bg-gradient-to-r from-accent to-violet text-white shadow-[0_12px_32px_rgba(0,122,255,0.3)] hover:-translate-y-0.5" : "border-2 border-ink text-ink hover:bg-ink hover:text-white"}`}>{plan.cta}</button></div>))}</div></div>)}
      </main>
    </div>
  );
}

function Leaderboard({ onBack, onAuth }: { onBack: () => void; onAuth: () => void }) {
  const LEADERBOARD = [{ rank: 1, name: "Alex M.", avatar: "🦊", accuracy: 94.2, sessions: 187, streak: 42, plan: "enterprise" }, { rank: 2, name: "Sarah K.", avatar: "🦉", accuracy: 92.8, sessions: 156, streak: 38, plan: "pro" }, { rank: 3, name: "David L.", avatar: "🐺", accuracy: 91.5, sessions: 203, streak: 35, plan: "enterprise" }, { rank: 4, name: "Emma R.", avatar: "🦅", accuracy: 90.1, sessions: 134, streak: 29, plan: "pro" }, { rank: 5, name: "James W.", avatar: "🐻", accuracy: 89.7, sessions: 178, streak: 27, plan: "pro" }];
  return (
    <div className="relative min-h-screen bg-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true"><div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.08),transparent_65%)]" /></div>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8"><button onClick={onBack} className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-accent to-violet"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="6" r="2.4" fill="white" stroke="none" /><circle cx="6" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><circle cx="18" cy="17" r="2.4" fill="white" stroke="none" opacity=".85" /><path d="M12 6 6 17M12 6l6 11M6 17h12" opacity=".8" /></svg></span><span className="leading-none"><span className="block text-[17px] font-extrabold tracking-tight text-ink">Synapse</span><span className="block font-display text-[8.5px] font-semibold uppercase tracking-[0.26em] text-faint">Judgement</span></span></button><button onClick={onAuth} className="rounded-full bg-gradient-to-r from-accent to-violet px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(0,122,255,0.3)] transition-all duration-300 hover:-translate-y-0.5">Join the court</button></div></header>
      <main className="relative z-10 mx-auto max-w-6xl px-5 py-12 md:px-8">
        <Reveal><div className="text-center"><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Leaderboard</p><h1 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">The most accurate minds.</h1><p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-sub">Real users. Real verdicts. See who's getting it right.</p></div></Reveal>
        <Reveal delay={100}><div className="mt-10 grid gap-4 sm:grid-cols-3">{[{ label: "Active analysts", value: "2,847", icon: "layers" }, { label: "Verdicts this week", value: "12,439", icon: "gauge" }, { label: "Avg accuracy", value: "87.3%", icon: "target" }].map((s) => (<div key={s.label} className="rounded-[18px] border border-line bg-card p-5 text-center"><span className="flex h-10 w-10 mx-auto items-center justify-center rounded-[11px] bg-accent/10 text-accent"><Icon name={s.icon as any} size={20} /></span><p className="mt-3 font-mono text-[28px] font-bold text-ink">{s.value}</p><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{s.label}</p></div>))}</div></Reveal>
        <Reveal delay={200}><div className="mt-12 rounded-[24px] border border-line bg-card p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">Top 5</p><h3 className="mt-1.5 text-xl font-extrabold tracking-tight">This month's accuracy leaders</h3></div><span className="hidden rounded-full bg-paper px-3 py-1.5 font-mono text-[11px] font-semibold text-sub sm:block">Updated hourly</span></div><div className="mt-6 space-y-2.5">{LEADERBOARD.map((u) => (<div key={u.rank} className={`flex items-center gap-4 rounded-[14px] border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft ${u.rank <= 3 ? "border-accent/20 bg-white" : "border-line bg-white"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-[14px] font-bold ${u.rank === 1 ? "bg-gradient-to-br from-amber to-orange text-white" : u.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-400 text-white" : u.rank === 3 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white" : "bg-paper text-faint"}`}>{u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : `#${u.rank}`}</span><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/10 to-violet/10 text-[20px]">{u.avatar}</span><div className="min-w-0 flex-1"><p className="text-[14px] font-extrabold text-ink">{u.name}</p><div className="flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] ${u.plan === "enterprise" ? "bg-gradient-to-r from-accent to-violet text-white" : u.plan === "pro" ? "bg-amber/15 text-amber" : "bg-paper text-sub"}`}>{u.plan}</span><span className="font-mono text-[10.5px] text-faint">{u.sessions} sessions</span></div></div><div className="hidden text-right sm:block"><p className="font-mono text-[10.5px] text-faint">streak</p><p className="font-mono text-[14px] font-bold text-ink">{u.streak} 🔥</p></div><div className="text-right"><p className="font-mono text-[10.5px] text-faint">accuracy</p><p className="font-mono text-[18px] font-bold text-mint">{u.accuracy}%</p></div></div>))}</div></div></Reveal>
        <Reveal delay={300}><div className="mt-12 rounded-[28px] bg-ink p-10 text-center text-white"><h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">Think you can beat the top 5?</h2><p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/60">Join 2,847 analysts already using Synapse Judgement.</p><button onClick={onAuth} className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,255,255,0.25)]">Join the court<Icon name="arrowUpRight" size={17} /></button></div></Reveal>
      </main>
    </div>
  );
}
