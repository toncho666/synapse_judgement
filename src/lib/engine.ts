export type AgentId = "tech" | "fund" | "port" | "news" | "earn";
export type Signal = "bull" | "bear" | "flat";
export type VerdictKind = "BUY" | "HOLD" | "SELL";

export interface AgentDef {
  id: AgentId;
  name: string;
  short: string;
  desc: string;
  price: number;
  color: string;
  tags: string[];
  speed: string;
}

export const JUDGE_PRICE = 15;
export const JUDGE_NAME = "The Judge";

export const AGENTS: AgentDef[] = [
  {
    id: "tech",
    name: "Technical",
    short: "Technical",
    desc: "Reads the chart like a language: trend, volume, liquidity at key levels and momentum.",
    price: 5,
    color: "#007AFF",
    tags: ["Candles", "Levels", "RSI"],
    speed: "~15 sec",
  },
  {
    id: "fund",
    name: "Fundamental",
    short: "Fundamental",
    desc: "Takes the financials apart to the last dollar: margins, cash flow, debt load.",
    price: 7,
    color: "#5856D6",
    tags: ["P/E", "FCF", "Debt"],
    speed: "~25 sec",
  },
  {
    id: "port",
    name: "Portfolio",
    short: "Portfolio",
    desc: "Looks at the trade in the context of your portfolio: correlations, risk, weights.",
    price: 6,
    color: "#00C7BE",
    tags: ["Correlation", "VaR", "Weight"],
    speed: "~20 sec",
  },
  {
    id: "news",
    name: "News",
    short: "News",
    desc: "Scans 10,400+ sources in real time and separates signal from noise.",
    price: 4,
    color: "#FF9500",
    tags: ["Media", "Social", "Tone"],
    speed: "~10 sec",
  },
  {
    id: "earn",
    name: "Earning Calls",
    short: "Calls",
    desc: "Listens to management calls: tone, slip-ups, guidance versus consensus.",
    price: 8,
    color: "#FF2D55",
    tags: ["Transcripts", "Guidance", "CEO tone"],
    speed: "~30 sec",
  },
];

export interface AgentVerdict {
  agentId: AgentId;
  signal: Signal;
  score: number; // -1..1
  confidence: number; // 0..100
  lines: string[];
  metrics: { label: string; value: string }[];
}

export interface SessionResult {
  ticker: string;
  session: string;
  basePrice: number;
  target: number;
  agents: AgentVerdict[];
  composite: number; // -1..1
  verdict: VerdictKind;
  verdictWord: string;
  verdictConfidence: number;
  consensus: { bull: number; flat: number; bear: number };
  rationale: string[];
}

/* ---------- seeded rng ---------- */
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const fmt1 = (v: number) => v.toFixed(1);
const fmt2 = (v: number) => v.toFixed(2);

export function fmtMoney(v: number) {
  return "$" + Math.round(v).toLocaleString("en-US");
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/* ---------- line pools ---------- */
function techLines(s: number, r: () => number, lvl: number) {
  const bull = [
    `Price reclaimed the 200-day moving average — volume confirms the move.`,
    `RSI ${58 + Math.round(r() * 9)}, not overbought: the trend still has fuel.`,
    `Liquidity swept at ${fmt2(lvl * 0.94)} — the technical path to ${fmt2(lvl * 1.08)} is open.`,
    `Bullish daily structure: higher highs and a rising OBV.`,
  ];
  const bear = [
    `Broke and held below ${fmt2(lvl * 0.97)}: sellers control the volume.`,
    `RSI ${29 + Math.round(r() * 9)}, structure is down — bounces look corrective.`,
    `A pool of stop liquidity sits under the market: cascade risk remains.`,
    `The daily death cross confirms the pressure.`,
  ];
  const flat = [
    `Range-bound between ${fmt2(lvl * 0.96)} and ${fmt2(lvl * 1.04)}: volume is compressing, the market waits for a trigger.`,
    `Neutral structure — no trend, no meaningful divergence.`,
    `Volatility sits in the lowest decile of the year: a coiled spring before an impulse.`,
  ];
  return s > 0.18 ? bull : s < -0.18 ? bear : flat;
}

function fundLines(s: number, r: () => number) {
  const bull = [
    `FCF margin ${fmt1(14 + r() * 12)}% — the business throws off cash with room to spare.`,
    `Forward P/E ${fmt1(14 + r() * 10)} — below the five-year median: growth isn't priced in.`,
    `Net Debt / EBITDA ${fmt1(0.4 + r() * 1.1)} — the balance sheet survives any rate path.`,
    `Buybacks at ${fmt1(2 + r() * 3)}% of market cap a year support EPS.`,
  ];
  const bear = [
    `Margins have compressed for three straight quarters: operating leverage works in reverse.`,
    `Forward P/E ${fmt1(28 + r() * 14)} — the top decile of its historical range.`,
    `Debt is growing faster than EBITDA: refinancing will be more expensive.`,
    `FCF is under capex pressure — payback is questionable.`,
  ];
  const flat = [
    `Valuation near the historical median: no discount, no premium.`,
    `Margins stable, growth moderate — fundamentals without surprises.`,
    `The balance sheet is steady: no catalysts for a re-rating in sight.`,
  ];
  return s > 0.18 ? bull : s < -0.18 ? bear : flat;
}

function portLines(s: number, r: () => number, hasPortfolio: boolean) {
  const share = fmt1(3 + r() * 9);
  const corr = fmt2(0.3 + r() * 0.55);
  const bull = [
    hasPortfolio
      ? `A ${share}% position stays inside the risk budget and creates no tilt.`
      : `A position of this size creates no tilt in a balanced portfolio.`,
    `Correlation with the portfolio core is ${corr} — diversification holds.`,
    `Contribution to portfolio volatility is moderate: ${fmt1(4 + r() * 6)}% at target weight.`,
    `Paired with current holdings, it adds negative beta to drawdown scenarios.`,
  ];
  const bear = [
    `Correlation of ${corr} with an already crowded segment — concentration rises.`,
    hasPortfolio
      ? `Above a ${share}% weight the portfolio breaches its growth-factor limit.`
      : `The position deepens the portfolio's tilt toward growth and tech.`,
    `Stress test: in a −20% market, the position adds ${fmt1(3 + r() * 4)} pp of drawdown.`,
  ];
  const flat = [
    `Neutral impact on the risk profile at a target weight of ${share}%.`,
    `Correlations are healthy; the position doesn't shift factor exposure.`,
  ];
  return s > 0.18 ? bull : s < -0.18 ? bear : flat;
}

function newsLines(s: number, r: () => number) {
  const bull = [
    `Sentiment ${Math.round(62 + r() * 20)}% positive over 72 hours — no negative spikes.`,
    `${2 + Math.round(r() * 9)}K mentions a day: interest is rising without hysteria.`,
    `Major outlets shifted from neutral to a positive tone after the latest data.`,
    `No insider sales on record — the backdrop is clean.`,
  ];
  const bear = [
    `A regulatory headline drove ${Math.round(40 + r() * 25)}% negativity across the feed in 48 hours.`,
    `A negative wave on social: ${Math.round(15 + r() * 30)}K mentions with falling sentiment.`,
    `A media investigation is gaining reach — more headlines are likely.`,
  ];
  const flat = [
    `The information backdrop is quiet: no material headlines in 72 hours.`,
    `Tone is near neutral; no mention spikes detected.`,
  ];
  return s > 0.18 ? bull : s < -0.18 ? bear : flat;
}

function earnLines(s: number, r: () => number) {
  const bull = [
    `Management flagged a record backlog three times — confidence above the norm.`,
    `Guidance raised ${fmt1(2 + r() * 5)}% above consensus: a rare tell.`,
    `CFO tone firmer than last quarter: evasive phrasing down ${Math.round(20 + r() * 25)}%.`,
    `The margin question got a concrete number — unusual transparency.`,
  ];
  const bear = [
    `The word “uncertainty” appeared ${6 + Math.round(r() * 9)} times — twice the usual rate.`,
    `Guidance ${fmt1(1.5 + r() * 4)}% below consensus — management is baking in caution.`,
    `The CEO dodged the margin question — a pattern that preceded past downgrades.`,
  ];
  const flat = [
    `An uneventful call: guidance confirmed, rhetoric neutral.`,
    `The Q&A ran evenly — no red flags, no obvious drivers.`,
  ];
  return s > 0.18 ? bull : s < -0.18 ? bear : flat;
}

/* ---------- metrics ---------- */
function agentMetrics(id: AgentId, s: number, r: () => number, hasPortfolio: boolean) {
  const sign = s > 0 ? "+" : "";
  switch (id) {
    case "tech":
      return [
        { label: "RSI 14", value: String(Math.round(s > 0 ? 58 + r() * 12 : 30 + r() * 12)) },
        { label: "Trend 200D", value: s > 0 ? "above" : s < 0 ? "below" : "at the line" },
        { label: "Momentum 30D", value: sign + fmt1(s * (6 + r() * 9)) + "%" },
      ];
    case "fund":
      return [
        { label: "P/E fwd", value: fmt1(s > 0 ? 15 + r() * 10 : 27 + r() * 14) },
        { label: "FCF margin", value: fmt1(s > 0 ? 14 + r() * 12 : 4 + r() * 6) + "%" },
        { label: "ND/EBITDA", value: fmt2(s > 0 ? 0.4 + r() * 1.1 : 2.2 + r() * 1.6) },
      ];
    case "port":
      return [
        { label: "Correlation", value: fmt2(0.3 + r() * 0.55) },
        { label: "Weight", value: fmt1(3 + r() * 9) + "%" },
        { label: hasPortfolio ? "Risk contrib." : "Volatility", value: fmt1(4 + r() * 8) + "%" },
      ];
    case "news":
      return [
        { label: "Sentiment", value: (s >= 0 ? "+" : "−") + Math.round(20 + r() * 45) },
        { label: "Mentions 24h", value: String(Math.round(1.2 + r() * 9)) + "K" },
        { label: "Triggers", value: s < 0 ? "2 active" : "none" },
      ];
    case "earn":
      return [
        { label: "Call tone", value: s > 0 ? "confident" : s < 0 ? "cautious" : "steady" },
        { label: "Guidance vs cons.", value: sign + fmt1(s * (1.5 + r() * 4)) + "%" },
        { label: "Calls sampled", value: String(3 + Math.round(r() * 3)) },
      ];
  }
}

/* ---------- main ---------- */
export function runAnalysis(
  tickerRaw: string,
  agentIds: AgentId[],
  nonce: number,
  hasPortfolio: boolean,
): SessionResult {
  const ticker = tickerRaw.trim().toUpperCase();
  const r = mulberry32(xmur3(ticker + ":" + nonce)());
  const basePrice = 18 + r() * 860;
  const base = (r() - 0.5) * 1.15;

  const bias: Record<AgentId, number> = {
    tech: 0.08, fund: 0.05, port: -0.03, news: 0.1, earn: -0.05,
  };

  const agents: AgentVerdict[] = agentIds.map((id) => {
    const score = clamp(base + bias[id] + (r() - 0.5) * 0.95, -1, 1);
    const signal: Signal = score > 0.18 ? "bull" : score < -0.18 ? "bear" : "flat";
    const confidence = Math.round(54 + r() * 41);
    const pool =
      id === "tech" ? techLines(score, r, basePrice)
      : id === "fund" ? fundLines(score, r)
      : id === "port" ? portLines(score, r, hasPortfolio)
      : id === "news" ? newsLines(score, r)
      : earnLines(score, r);
    const shuffled = [...pool].sort(() => r() - 0.5);
    const lines = shuffled.slice(0, Math.min(3, shuffled.length));
    return { agentId: id, signal, score, confidence, lines, metrics: agentMetrics(id, score, r, hasPortfolio) };
  });

  const wSum = agents.reduce((a, v) => a + v.confidence, 0);
  const composite = wSum > 0 ? agents.reduce((a, v) => a + v.score * v.confidence, 0) / wSum : 0;

  const consensus = {
    bull: agents.filter((a) => a.signal === "bull").length,
    flat: agents.filter((a) => a.signal === "flat").length,
    bear: agents.filter((a) => a.signal === "bear").length,
  };
  const agree = Math.max(consensus.bull, consensus.flat, consensus.bear);

  const verdict: VerdictKind = composite >= 0.28 ? "BUY" : composite <= -0.28 ? "SELL" : "HOLD";
  const verdictWord = verdict === "BUY" ? "Buy" : verdict === "SELL" ? "Sell" : "Hold";
  const verdictConfidence = clamp(
    Math.round(46 + Math.abs(composite) * 48 + (agree / Math.max(1, agents.length)) * 16),
    38, 97,
  );

  const target = basePrice * (1 + composite * 0.28 + (r() - 0.5) * 0.06);

  const strongest = [...agents].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];
  const defOf = (id: AgentId) => AGENTS.find((a) => a.id === id)!;

  const rationale: string[] = [];
  rationale.push(
    `${agree} of ${agents.length} ${plural(agents.length, "agent", "agents")} on the same side — consensus weight ${Math.round(
      (agree / Math.max(1, agents.length)) * 100,
    )}%.`,
  );
  if (strongest) {
    const dir = strongest.score > 0 ? "bullish" : strongest.score < 0 ? "bearish" : "neutral";
    rationale.push(
      `The strongest ${dir} argument comes from ${defOf(strongest.agentId).short} (confidence ${strongest.confidence}%).`,
    );
  }
  const dissenter = agents.find((a) => (composite >= 0 ? a.signal === "bear" : composite > 0 ? false : a.signal === "bull"));
  if (dissenter) {
    rationale.push(
      `The lone dissent comes from ${defOf(dissenter.agentId).short}, counted at a ${dissenter.confidence}% weight.`,
    );
  }
  rationale.push(
    composite >= 0.28
      ? `Composite signal ${fmt2(composite * 100)} pts out of 100 — the bullish edge is durable.`
      : composite <= -0.28
        ? `Composite signal ${fmt2(composite * 100)} pts out of 100 — the bearish case outweighs.`
        : `Composite signal ${fmt2(composite * 100)} pts out of 100 — the arguments are balanced.`,
  );

  return {
    ticker,
    session: "SN-" + String(Math.floor(1000 + r() * 9000)),
    basePrice,
    target,
    agents,
    composite,
    verdict,
    verdictWord,
    verdictConfidence,
    consensus,
    rationale,
  };
}
