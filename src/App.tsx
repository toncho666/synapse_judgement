import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import RequestSection from "./components/RequestSection";
import AgentStore from "./components/AgentStore";
import Pipeline from "./components/Pipeline";
import ResultsDashboard, { type Stage } from "./components/ResultsDashboard";
import StickyBar from "./components/StickyBar";
import Transparency from "./components/Transparency";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import AgentPage from "./components/AgentPage";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import Reveal from "./components/Reveal";
import Icon from "./components/Icon";
import { useHashRoute } from "./lib/router";
import { useReducedMotion } from "./lib/hooks";
import { getUser, type User } from "./lib/auth";
import {
  AGENTS, JUDGE_PRICE, runAnalysis,
  type AgentId, type SessionResult,
} from "./lib/engine";

export default function App() {
  const reduced = useReducedMotion();
  const { route, nav } = useHashRoute();
  const routeKey = 
    route.name === "agent" ? `agent-${route.id}` :
    route.name === "auth" ? "auth" :
    route.name === "dashboard" ? "dashboard" :
    route.name === "leaderboard" ? "leaderboard" :
    "home";

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

  // Check for logged-in user on mount
  useEffect(() => {
    setUser(getUser());
  }, []);

  /* ---------- routing: scroll management ---------- */
  const routeRef = useRef(route);
  routeRef.current = route;
  const pendingScroll = useRef<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
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

  /* plain "#section" links on agent pages: go home first, then scroll */
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

  const goHome = useCallback(
    (section?: string) => {
      if (section) pendingScroll.current = section;
      nav({ name: "home" });
    },
    [nav],
  );

  /* ---------- order state ---------- */
  const judgeFree = selected.length > 1;
  const base = selected.reduce((s, id) => s + (AGENTS.find((a) => a.id === id)?.price ?? 0), 0);
  const judgeCost = selected.length === 0 ? 0 : judgeFree ? 0 : JUDGE_PRICE;
  const total = base + judgeCost;
  const validTicker = /^[A-Z.\-]{1,7}$/.test(ticker);

  const toggleAgent = (id: AgentId) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

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
      timers.current.push(setTimeout(() => {
        setProcessed(n);
        setStage("agents");
      }, 500));
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
    if (!reduced) {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [reduced]);

  const newSession = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage("idle");
    setResult(null);
    setProcessed(0);
  }, []);

  const totalCost = useMemo(() => orderCost + orderJudge, [orderCost, orderJudge]);

  // Handle auth success
  const handleAuthSuccess = useCallback(() => {
    setUser(getUser());
    nav({ name: "dashboard" });
  }, [nav]);

  // Handle logout
  const handleLogout = useCallback(() => {
    setUser(null);
    nav({ name: "home" });
  }, [nav]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-white text-ink">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="anim-drift1 absolute -top-32 right-[-10%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.10),transparent_65%)]" />
        <div className="anim-drift2 absolute top-[38%] left-[-12%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.10),transparent_65%)]" />
        <div className="absolute bottom-[-18%] right-[8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(0,199,190,0.07),transparent_65%)]" />
      </div>

      {/* Auth page */}
      {route.name === "auth" ? (
        <AuthPage onSuccess={handleAuthSuccess} onBack={goHome} />
      ) : route.name === "dashboard" ? (
        user ? (
          <Dashboard onLogout={handleLogout} onHome={goHome} />
        ) : (
          <AuthPage onSuccess={handleAuthSuccess} onBack={goHome} />
        )
      ) : route.name === "leaderboard" ? (
        <Leaderboard onBack={goHome} onAuth={() => nav({ name: "auth" })} />
      ) : (
        <>
          <Nav user={user} onDashboard={() => nav({ name: "dashboard" })} onAuth={() => nav({ name: "auth" })} />

          {route.name === "agent" ? (
            <main className="relative z-10">
              <AgentPage
                agent={AGENTS.find((a) => a.id === route.id)!}
                selected={selected}
                onToggle={toggleAgent}
                goHome={goHome}
              />
            </main>
          ) : (
            <main className="relative z-10">
              <Hero />

              <div className="relative">
                <RequestSection
                  ticker={ticker}
                  onTicker={setTicker}
                  portfolio={portfolio}
                  onPortfolio={setPortfolio}
                  selectedCount={selected.length}
                  total={total}
                  judgeFree={judgeFree}
                />
                {errorNonce > 0 && (
                  <div key={errorNonce} className="anim-shake absolute inset-x-5 bottom-8 z-20 mx-auto max-w-xl md:inset-x-8">
                    <p className="flex items-center gap-2.5 rounded-full border border-flame/30 bg-[#fff1f0] px-5 py-3 text-[13.5px] font-semibold text-[#b3271e] shadow-soft">
                      <Icon name="bolt" size={16} />
                      Enter a ticker — for example, AAPL or NVDA.
                    </p>
                  </div>
                )}
              </div>

              <AgentStore selected={selected} onToggle={toggleAgent} />
              <Pipeline />
              <ResultsDashboard
                stage={stage}
                result={result}
                totalCost={totalCost}
                processed={processed}
                onRevealVerdict={revealVerdict}
                onNewSession={newSession}
              />
              <Transparency />
              <Faq />

              {/* final CTA */}
              <section className="mx-auto max-w-6xl px-5 pb-28 md:px-8">
                <Reveal>
                  <div className="relative overflow-hidden rounded-[32px] bg-ink px-8 py-16 text-center text-white md:py-20">
                    <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,122,255,0.4),transparent_70%)]" />
                    <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.45),transparent_70%)]" />
                    <h2 className="relative text-3xl font-extrabold tracking-tight md:text-5xl">
                      The court is in session.
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-white/60">
                      Five analysts. One verdict. Pick your team — and see what the Judge decides about{" "}
                      {validTicker ? ticker : "your ticker"}.
                    </p>
                    <a
                      href="#agents"
                      className="relative mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-9 py-4 text-[15px] font-extrabold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(255,255,255,0.25)]"
                    >
                      Build your team
                      <Icon name="arrowDown" size={17} />
                    </a>
                  </div>
                </Reveal>
              </section>
            </main>
          )}

          <Footer />

          <StickyBar
            selected={selected}
            total={total}
            judgeFree={judgeFree}
            stage={stage}
            processed={processed}
            onRun={launch}
            onNewSession={newSession}
          />
        </>
      )}

      <div className="grain" aria-hidden="true" />
    </div>
  );
}
