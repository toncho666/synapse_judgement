import { useEffect, useState } from "react";
import Icon from "./Icon";
import { AGENTS } from "../lib/engine";

/* ---------- synthesis schematic ---------- */
function SynapseViz() {
  const C = 280;
  const R = 188;
  const nodes = AGENTS.map((a, i) => {
    const ang = ((-90 + i * 72) * Math.PI) / 180;
    return {
      ...a,
      x: C + R * Math.cos(ang),
      y: C + R * Math.sin(ang),
    };
  });
  const pct = (v: number) => `${(v / 560) * 100}%`;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] select-none">
      {/* orbit ring */}
      <div className="anim-spin-slow absolute inset-[6.5%] rounded-full border border-dashed border-line" />
      <div className="absolute inset-[16%] rounded-full border border-line/70" />
      {/* center glow */}
      <div className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(88,86,214,0.16),rgba(0,122,255,0.05)_60%,transparent_72%)]" />

      {/* lines */}
      <svg viewBox="0 0 560 560" className="absolute inset-0 h-full w-full">
        {nodes.map((n) => (
          <line key={`b-${n.id}`} x1={C} y1={C} x2={n.x} y2={n.y} stroke="#E8E8ED" strokeWidth="1.5" />
        ))}
        {nodes.map((n, i) => (
          <line
            key={`p-${n.id}`}
            x1={C}
            y1={C}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.65"
            className="anim-dash"
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        ))}
      </svg>

      {/* agent nodes */}
      {nodes.map((n, i) => (
        <div
          key={n.id}
          className="absolute"
          style={{ left: pct(n.x), top: pct(n.y) }}
        >
          <div
            className="flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            style={{ animation: `bobFloat 3.4s ease-in-out ${i * 0.35}s infinite alternate` }}
          >
            <span
              className="flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-line bg-white shadow-soft transition-transform duration-300 hover:scale-110"
              style={{ color: n.color }}
            >
              <Icon name={n.id} size={28} />
            </span>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-faint">
              {n.short}
            </span>
          </div>
        </div>
      ))}

      {/* judge core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="anim-halo-white flex h-[124px] w-[124px] items-center justify-center rounded-full bg-gradient-to-br from-accent to-violet text-white shadow-[0_24px_60px_rgba(0,122,255,0.4)]">
          <Icon name="judge" size={46} strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">
          The Judge
        </p>
      </div>

      {/* floating meta chips */}
      <div className="absolute -right-2 top-[12%] hidden rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] font-medium text-sub shadow-soft sm:block">
        6 independent models
      </div>
      <div className="absolute -left-3 bottom-[16%] hidden items-center gap-2 rounded-full border border-line bg-white px-4 py-2 font-mono text-[11px] font-medium text-sub shadow-soft sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-mint" />
        verdict in ~90 sec
      </div>
    </div>
  );
}

/* ---------- market tape ---------- */
const TAPE = [
  ["AAPL", "232.41", "+0.84%"], ["NVDA", "1042.10", "+2.31%"], ["MSFT", "468.22", "−0.35%"],
  ["TSLA", "244.60", "+1.12%"], ["AMZN", "186.90", "+0.48%"], ["GOOGL", "171.03", "−0.22%"],
  ["META", "512.44", "+1.87%"], ["S&P 500", "5472.10", "+0.41%"], ["NASDAQ", "17862.4", "+0.66%"],
  ["BTC", "64 230", "−1.24%"], ["ETH", "3 418", "+0.92%"], ["US 10Y", "4.21%", "+0.02"],
  ["EUR/USD", "1.0842", "−0.11%"], ["BRENT", "84.12", "+0.57%"],
] as const;

function TapeRow() {
  return (
    <>
      {TAPE.map(([s, p, c]) => (
        <span key={s} className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-semibold text-ink">{s}</span>
          <span className="text-sub">{p}</span>
          <span className={c.startsWith("+") ? "text-mint" : "text-flame"}>{c}</span>
        </span>
      ))}
    </>
  );
}

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section className={loaded ? "is-loaded" : ""} id="top">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-32 md:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-24 lg:pt-40">
        <div>
          <div className="mask-line">
            <span>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-card px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-sub">
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-accent to-violet" />
                AI investment analytics platform
              </span>
            </span>
          </div>

          <h1 className="mt-7 text-[clamp(38px,5.6vw,76px)] font-extrabold leading-[1.03] tracking-[-0.03em]">
            <span className="mask-line">
              <span style={{ transitionDelay: "120ms" }}>Investment council.</span>
            </span>
            <span className="mask-line">
              <span style={{ transitionDelay: "260ms" }} className="relative inline-block">
                No compromises.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 320 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9c60-6 200-8 314-4"
                    stroke="url(#hg)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="hg" x1="0" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#007AFF" />
                      <stop offset="1" stopColor="#5856D6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </span>
          </h1>

          <div className="mask-line mt-7">
            <span style={{ transitionDelay: "400ms" }}>
              <p className="max-w-xl text-lg leading-relaxed text-sub md:text-xl">
                <strong className="font-bold text-ink">Pick your analysts. The Judge handles the rest.</strong>{" "}
                Six independent models break down the ticker in parallel — and argue with each other until
                a single verdict with reasoning is reached.
              </p>
            </span>
          </div>

          <div className="mask-line mt-9">
            <span style={{ transitionDelay: "520ms" }}>
              <span className="flex flex-wrap items-center gap-4">
                <a
                  href="#agents"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-accent to-violet px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_32px_rgba(0,122,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,122,255,0.45)]"
                >
                  Build your team
                  <Icon name="arrowDown" size={17} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                </a>
                <a
                  href="#synthesis"
                  className="group inline-flex items-center gap-2 text-[15px] font-bold text-accent transition-colors hover:text-violet"
                >
                  How the verdict is made
                  <Icon name="arrowUpRight" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </span>
            </span>
          </div>

          <div className="mask-line mt-12">
            <span style={{ transitionDelay: "640ms" }}>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] text-faint">
                <span>~90 sec to a verdict</span>
                <span className="h-1 w-1 rounded-full bg-line" />
                <span>10,400+ sources</span>
                <span className="h-1 w-1 rounded-full bg-line" />
                <span>0 subscriptions</span>
              </span>
            </span>
          </div>
        </div>

        <SynapseViz />
      </div>

      {/* market tape */}
      <div className="overflow-hidden border-y border-line bg-card/70">
        <div className="anim-marquee flex w-max items-center gap-10 py-3.5 font-mono text-[13px]">
          <span className="flex items-center gap-10"><TapeRow /></span>
          <span aria-hidden="true" className="flex items-center gap-10"><TapeRow /></span>
        </div>
      </div>
    </section>
  );
}
