import type { ReactNode } from "react";

/* ---------- seeded rng (deterministic charts) ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const UP = "#34c759";
const DOWN = "#ff3b30";

/* ---------- candlestick chart ---------- */
export function CandleChart() {
  const W = 680, H = 300, PL = 14, PR = 62, PT = 16, PB = 22;
  const r = mulberry32(1187);
  const n = 44;
  const candles: { o: number; c: number; h: number; l: number }[] = [];
  let p = 104;
  for (let i = 0; i < n; i++) {
    const drift = i > 28 ? 1.05 : 0.5;
    const change = (r() - 0.44) * 3.6 + drift * 0.22;
    const o = p;
    const c = p + change;
    const h = Math.max(o, c) + r() * 1.5;
    const l = Math.min(o, c) - r() * 1.5;
    candles.push({ o, c, h, l });
    p = c;
  }
  const lo = Math.min(...candles.map((c) => c.l)) - 2;
  const hi = Math.max(...candles.map((c) => c.h)) + 2;
  const x = (i: number) => PL + (i / (n - 1)) * (W - PL - PR);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);

  const closes = candles.map((c) => c.c);
  const sma: (number | null)[] = closes.map((_, i) => {
    if (i < 9) return null;
    const slice = closes.slice(i - 9, i + 1);
    return slice.reduce((a, b) => a + b, 0) / 10;
  });

  const support = lo + (hi - lo) * 0.08;
  const resistance = hi - (hi - lo) * 0.06;
  const sweepIdx = 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Sample price chart with support, resistance and 10-day SMA">
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={PL} x2={W - PR} y1={PT + t * (H - PT - PB)} y2={PT + t * (H - PT - PB)} stroke="#EFEFF2" strokeWidth="1" />
      ))}
      {/* support / resistance */}
      <line x1={PL} x2={W - PR} y1={y(support)} y2={y(support)} stroke={UP} strokeWidth="1.2" strokeDasharray="5 5" opacity="0.75" />
      <line x1={PL} x2={W - PR} y1={y(resistance)} y2={y(resistance)} stroke={DOWN} strokeWidth="1.2" strokeDasharray="5 5" opacity="0.65" />
      <text x={W - PR + 8} y={y(support) + 4} fontSize="11" fill={UP} fontFamily="JetBrains Mono, monospace">118.4</text>
      <text x={W - PR + 8} y={y(resistance) + 4} fontSize="11" fill={DOWN} fontFamily="JetBrains Mono, monospace">136.8</text>

      {/* candles */}
      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const col = up ? UP : DOWN;
        const bx = x(i);
        return (
          <g key={i}>
            <line x1={bx} x2={bx} y1={y(c.h)} y2={y(c.l)} stroke={col} strokeWidth="1.4" />
            <rect
              x={bx - 3.4}
              y={y(Math.max(c.o, c.c))}
              width="6.8"
              height={Math.max(2, Math.abs(y(c.o) - y(c.c)))}
              rx="1.4"
              fill={col}
              opacity={up ? 0.95 : 0.88}
            />
          </g>
        );
      })}

      {/* sma */}
      <polyline
        points={sma.map((v, i) => (v === null ? "" : `${x(i)},${y(v)}`)).filter(Boolean).join(" ")}
        fill="none"
        stroke="#5856D6"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* liquidity sweep marker */}
      <circle cx={x(sweepIdx)} cy={y(candles[sweepIdx].l)} r="6" fill="none" stroke="#007AFF" strokeWidth="1.8" />
      <text x={x(sweepIdx) - 40} y={y(candles[sweepIdx].l) + 22} fontSize="11" fill="#007AFF" fontFamily="JetBrains Mono, monospace">
        liquidity sweep
      </text>

      <text x={PL} y={H - 6} fontSize="10" fill="#A1A1A6" fontFamily="JetBrains Mono, monospace">T-44 sessions</text>
      <text x={W - PR - 40} y={H - 6} fontSize="10" fill="#A1A1A6" fontFamily="JetBrains Mono, monospace">today</text>
    </svg>
  );
}

/* ---------- horizontal bars (with optional centered baseline) ---------- */
export interface BarItem {
  label: string;
  value: number; // in [min..max]
  display: string;
  min?: number;
  max?: number;
}

export function HBars({ items, center = false, color = "#007AFF" }: { items: BarItem[]; center?: boolean; color?: string }) {
  return (
    <div className="space-y-3.5">
      {items.map((it) => {
        const min = it.min ?? 0;
        const max = it.max ?? 100;
        const span = max - min;
        const pct = Math.max(0, Math.min(100, ((it.value - min) / span) * 100));
        return (
          <div key={it.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-ink">{it.label}</span>
              <span className="font-mono text-[12.5px] font-bold text-ink">{it.display}</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-paper">
              {center && <span className="absolute inset-y-0 left-1/2 w-px bg-line" />}
              {center ? (
                it.value >= 0 ? (
                  <span
                    className="absolute inset-y-0 left-1/2 rounded-r-full transition-all duration-700"
                    style={{ width: `${pct / 2}%`, background: color }}
                  />
                ) : (
                  <span
                    className="absolute inset-y-0 right-1/2 rounded-l-full bg-flame/80 transition-all duration-700"
                    style={{ width: `${pct / 2}%` }}
                  />
                )
              ) : (
                <span
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- vertical bars ---------- */
export function VBars({ values, unit = "", color = "#FF9500" }: { values: number[]; unit?: string; color?: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-36 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="group relative flex-1">
          <div
            className="w-full rounded-t-[4px] transition-all duration-500 group-hover:opacity-80"
            style={{ height: `${(v / max) * 132 + 4}px`, background: i === values.length - 1 ? "#007AFF" : color, opacity: i === values.length - 1 ? 1 : 0.75 }}
          />
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-0.5 font-mono text-[10px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {v}{unit}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- correlation heatmap ---------- */
export function Heatmap({ labels, values }: { labels: string[]; values: number[][] }) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[420px] gap-1" style={{ gridTemplateColumns: `52px repeat(${labels.length}, 1fr)` }}>
        <span />
        {labels.map((l) => (
          <span key={l} className="pb-1 text-center font-mono text-[10.5px] font-semibold text-faint">{l}</span>
        ))}
        {values.map((row, i) => (
          <div key={labels[i]} className="contents">
            <span className="flex items-center font-mono text-[10.5px] font-semibold text-faint">{labels[i]}</span>
            {row.map((v, j) => {
              const alpha = i === j ? 0.9 : 0.12 + Math.max(0, v) * 0.62;
              return (
                <span
                  key={j}
                  title={`${labels[i]} × ${labels[j]} = ${v.toFixed(2)}`}
                  className={`flex h-9 cursor-default items-center justify-center rounded-[6px] font-mono text-[10.5px] font-semibold transition-transform duration-200 hover:scale-[1.08] ${
                    i === j ? "text-white" : v > 0.72 ? "text-white" : "text-ink/70"
                  }`}
                  style={{ background: `rgba(0,122,255,${alpha})` }}
                >
                  {v.toFixed(2).replace("0.", ".")}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- data table ---------- */
export function DataTable({ cols, rows }: { cols: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
      <table className="w-full min-w-[520px] text-left">
        <thead>
          <tr className="border-b border-line bg-card">
            {cols.map((c) => (
              <th key={c} className="px-4 py-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-line transition-colors hover:bg-card ${i === rows.length - 1 ? "border-b-0" : ""}`}>
              {r.map((cell, j) => (
                <td key={j} className={`px-4 py-3 text-[13.5px] ${j === 0 ? "font-bold text-ink" : "text-sub"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- signal chip ---------- */
export function SignalChip({ kind }: { kind: "bull" | "bear" | "flat" }) {
  const meta =
    kind === "bull"
      ? { label: "Bullish", cls: "bg-[#e9f9ef] text-[#1b7a41]", dot: "bg-mint" }
      : kind === "bear"
        ? { label: "Bearish", cls: "bg-[#fdeceb] text-[#b3271e]", dot: "bg-flame" }
        : { label: "Neutral", cls: "bg-paper text-sub", dot: "bg-faint" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[12px] font-semibold ${meta.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
