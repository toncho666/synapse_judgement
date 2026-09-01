import type { IconName } from "../components/Icon";
import type { AgentId, Signal } from "../lib/engine";

export interface AgentPageData {
  tagline: string;
  stats: { k: string; v: string }[];
  reads: { icon: IconName; title: string; text: string }[];
  methodology: { title: string; text: string }[];
  strengths: string[];
  blindSpots: string[];
  sample: {
    ticker: string;
    date: string;
    signal: Signal;
    confidence: number;
    summary: string[];
  };
}

export const AGENT_PAGES: Record<AgentId, AgentPageData> = {
  tech: {
    tagline: "Reads price like a language — structure, liquidity and momentum across five timeframes.",
    stats: [
      { v: "200+", k: "indicators tracked" },
      { v: "5", k: "timeframes, 1H to 1M" },
      { v: "3", k: "liquidity maps" },
      { v: "~15 sec", k: "per run" },
    ],
    reads: [
      { icon: "gauge", title: "Candlestick history", text: "Adjusted OHLCV from 1-hour to monthly, splits and dividends normalized." },
      { icon: "layers", title: "Volume & liquidity profile", text: "Where size actually trades — volume nodes, resting liquidity, sweep zones." },
      { icon: "target", title: "Order-flow footprints", text: "Dark-pool prints and block trades that never show on lit exchanges." },
      { icon: "bolt", title: "Volatility surface", text: "Term structure and skew — what options markets expect next." },
    ],
    methodology: [
      { title: "Structure first", text: "Trend, higher-timeframe levels and market structure are mapped before any oscillator is consulted." },
      { title: "Liquidity hunt", text: "The agent locates pools of stops and resting orders, then checks whether they were swept or respected." },
      { title: "Score & scenario", text: "Momentum, trend and volume votes are weighted into a score, then projected onto bull / base / bear paths." },
    ],
    strengths: [
      "Early read on momentum shifts via volume divergence",
      "Explicit levels — every claim maps to a price",
      "Multi-timeframe alignment filters out noise",
    ],
    blindSpots: [
      "Blind to fundamentals — a perfect chart can still be an overvalued business",
      "Whipsaws in low-liquidity ranges",
      "Gap events (earnings, macro) can invalidate structure instantly",
    ],
    sample: {
      ticker: "NVDA",
      date: "Feb 12, 2026",
      signal: "bull",
      confidence: 74,
      summary: [
        "Price reclaimed the 200-day moving average on expanding volume; daily structure prints higher highs.",
        "Liquidity swept at 118.4 — the low was taken, stops cleared, and buyers absorbed the offer.",
        "Key battle zone 124–131; a close above 136.8 opens the path to 152 with little overhead supply.",
      ],
    },
  },

  fund: {
    tagline: "Takes the financials apart to the last dollar — margins, cash flow and the balance sheet.",
    stats: [
      { v: "12 yrs", k: "of filings parsed" },
      { v: "43", k: "ratios per company" },
      { v: "6", k: "valuation scenarios" },
      { v: "~25 sec", k: "per run" },
    ],
    reads: [
      { icon: "fund", title: "SEC filings", text: "10-K, 10-Q and 8-K parsed line by line, including footnotes where risk hides." },
      { icon: "target", title: "Consensus & guidance", text: "Street estimates versus management guidance, and the drift between the two." },
      { icon: "shield", title: "Capital structure", text: "Debt stack, maturities, covenants and refinancing risk under higher rates." },
      { icon: "spark", title: "Segment economics", text: "Unit economics per business line — which engine actually earns the margin." },
    ],
    methodology: [
      { title: "Normalize", text: "One-offs, stock-based comp and accounting noise are stripped to expose real earnings power." },
      { title: "Stress the balance sheet", text: "Cash conversion, debt maturities and covenant headroom are tested against adverse rates." },
      { title: "Price vs value", text: "Multiples are compared to the company's own history and sector peers, not to a vacuum." },
    ],
    strengths: [
      "Catches earnings-quality tricks in the footnotes",
      "Valuation discipline — never chases a story without numbers",
      "Explicit downside case in every report",
    ],
    blindSpots: [
      "Slow to react — filings lag the business by weeks",
      "Discounts narrative-driven re-ratings",
      "Consensus-anchored: can miss truly novel business models",
    ],
    sample: {
      ticker: "NVDA",
      date: "Feb 12, 2026",
      signal: "bull",
      confidence: 81,
      summary: [
        "FCF margin expanded to 46% — the business converts growth into cash, not just revenue.",
        "Forward P/E of 31 sits below the five-year median of 48.6: growth is not fully priced in.",
        "Net-cash balance sheet; buybacks at ~2% of market cap a year quietly support EPS.",
      ],
    },
  },

  port: {
    tagline: "Judges the trade in context — correlations, factor exposure and what a loss would cost you.",
    stats: [
      { v: "1,200+", k: "assets covered" },
      { v: "5", k: "factor exposures" },
      { v: "10K", k: "Monte-Carlo paths" },
      { v: "~20 sec", k: "per run" },
    ],
    reads: [
      { icon: "port", title: "Your holdings", text: "The portfolio you optionally share — weights, sectors, factor tilts, concentration." },
      { icon: "layers", title: "Correlation regime", text: "Rolling correlations, and whether they spike together exactly when you don't want them to." },
      { icon: "gauge", title: "Risk models", text: "VaR, expected shortfall and marginal risk contribution of the new position." },
      { icon: "shield", title: "Stress scenarios", text: "2008, 2020, 2022-style drawdowns replayed against the combined portfolio." },
    ],
    methodology: [
      { title: "Map the overlap", text: "The candidate is decomposed into factors and compared to what you already own." },
      { title: "Measure the tail", text: "10,000 simulated paths estimate how the position behaves in the worst weeks, not the average ones." },
      { title: "Size it", text: "A recommended weight band keeps the position inside the portfolio's risk budget." },
    ],
    strengths: [
      "Turns “good stock” into “good position for you”",
      "Quantifies the cost of concentration",
      "Explicit sizing band, not vague conviction",
    ],
    blindSpots: [
      "Garbage in, garbage out — needs honest portfolio data",
      "Historical correlations break in novel crises",
      "Says nothing about the business itself",
    ],
    sample: {
      ticker: "NVDA",
      date: "Feb 12, 2026",
      signal: "flat",
      confidence: 63,
      summary: [
        "Correlation with the existing tech core is 0.74 — the position adds exposure, not diversification.",
        "At a 5% weight, 95% VaR contribution is 1.9% of portfolio value — inside the risk budget.",
        "In a −20% market scenario the position would add ~2.7 pp of extra drawdown.",
      ],
    },
  },

  news: {
    tagline: "Scans 10,400+ sources in real time and separates signal from noise.",
    stats: [
      { v: "10,400+", k: "sources live" },
      { v: "92", k: "languages parsed" },
      { v: "40 ms", k: "headline latency" },
      { v: "~10 sec", k: "per run" },
    ],
    reads: [
      { icon: "news", title: "Wire services & media", text: "Reuters, Bloomberg, FT and 300+ outlets, de-duplicated and clustered by event." },
      { icon: "spark", title: "Social & forums", text: "Retail flow of narratives — surges, sentiment flips and coordinated campaigns." },
      { icon: "lock", title: "Insider filings", text: "Form 4 transactions matched against 10b5-1 plans to filter routine sales." },
      { icon: "shield", title: "Regulatory feed", text: "DOJ, SEC, EU and export-control dockets the moment they move." },
    ],
    methodology: [
      { title: "Cluster events", text: "Thousands of headlines collapse into distinct events, each scored for novelty and reach." },
      { title: "Weigh the source", text: "A Bloomberg exclusive outweighs a recycled blog post; weight follows track record." },
      { title: "Separate flow from noise", text: "Persistent sentiment drift is signal; one-off viral spikes are usually noise." },
    ],
    strengths: [
      "Fastest agent — catches catalysts within minutes",
      "Source-weighted, not headline-counted",
      "Flags regulatory risk before it hits the price",
    ],
    blindSpots: [
      "Can overreact to a single large outlet",
      "Irony and satire occasionally survive parsing",
      "Says nothing about whether the news is priced in",
    ],
    sample: {
      ticker: "NVDA",
      date: "Feb 12, 2026",
      signal: "bull",
      confidence: 68,
      summary: [
        "Sentiment 78% positive over 72 hours, driven by Blackwell Ultra supply updates — no negative spikes.",
        "Mentions doubled week over week without hysteria: interest is rising, not panicking.",
        "One open risk: the EU networking-discount inquiry is gaining reach in tier-one press.",
      ],
    },
  },

  earn: {
    tagline: "Listens to management calls — tone, slip-ups and guidance versus consensus.",
    stats: [
      { v: "28", k: "transcripts archived" },
      { v: "4", k: "calls cross-analyzed" },
      { v: "190", k: "tone markers" },
      { v: "~30 sec", k: "per run" },
    ],
    reads: [
      { icon: "earn", title: "Earnings transcripts", text: "The last four quarters of prepared remarks and unscripted Q&A, word by word." },
      { icon: "gauge", title: "Tone analytics", text: "Hedging density, evasiveness index and sentiment shift between remarks and Q&A." },
      { icon: "target", title: "Guidance vs consensus", text: "Every guide item compared to street estimates at the moment it was given." },
      { icon: "layers", title: "Cross-call patterns", text: "Phrases that reappear, disappear or change meaning from call to call." },
    ],
    methodology: [
      { title: "Read between the lines", text: "What management declines to repeat is often louder than what they say." },
      { title: "Q&A over script", text: "Prepared remarks are polished; analyst Q&A is where confidence is tested." },
      { title: "Track the drift", text: "Guidance language is compared across quarters to catch quiet de-risking early." },
    ],
    strengths: [
      "Detects de-risking language quarters before guidance cuts",
      "Quantifies tone — not vibes",
      "Holds management accountable to prior promises",
    ],
    blindSpots: [
      "Great actors can pass a tone test",
      "Only as frequent as the earnings calendar",
      "Sector jargon can mask meaning from any parser",
    ],
    sample: {
      ticker: "NVDA",
      date: "Feb 12, 2026",
      signal: "bull",
      confidence: 77,
      summary: [
        "Guidance raised 3.4% above consensus — the fourth consecutive beat on the guide itself.",
        "Evasiveness index at 18/100, down from 31 a year ago; Q&A answers got more specific.",
        "The margin guide bakes in new-product mix without assuming memory pricing relief — conservative.",
      ],
    },
  },
};

/* ================= sample-report datasets ================= */

export const TECH_REPORT = {
  indicators: {
    cols: ["Indicator", "Value", "Reading", "Signal"],
    rows: [
      ["RSI (14)", "61.4", "Bullish, not stretched", "bull"],
      ["MACD (12/26)", "+2.31", "Histogram expanding", "bull"],
      ["ATR (14)", "3.8%", "Elevated — size for it", "flat"],
      ["OBV Δ 30d", "+4.2%", "Accumulation intact", "bull"],
      ["Price vs 200D SMA", "+14.2%", "Trend regime: up", "bull"],
      ["ADX (14)", "34.1", "Trend present, not extreme", "flat"],
    ],
  },
  timeframes: {
    cols: ["Timeframe", "Structure", "Key level", "Bias"],
    rows: [
      ["Weekly", "Strong uptrend", "Above 118.4", "bull"],
      ["Daily", "Uptrend, pullback to 50D", "124.0 pivot", "bull"],
      ["4H", "Range compression", "124 – 131", "flat"],
      ["1H", "Short-term corrective", "Lower highs", "bear"],
    ],
  },
  scenarios: {
    cols: ["Scenario", "Probability", "Trigger", "Target"],
    rows: [
      ["Bull", "38%", "Close above 136.8 on volume", "$152.4"],
      ["Base", "44%", "Range 124 – 136.8 holds", "$141.0"],
      ["Bear", "18%", "Loss of 118.4 support", "$116.2"],
    ],
  },
};

export const FUND_REPORT = {
  quarters: {
    cols: ["Quarter", "Revenue", "YoY", "FCF margin", "Net debt / EBITDA", "Buyback"],
    rows: [
      ["Q1 FY26", "$26.0B", "+262%", "41%", "net cash", "$7.7B"],
      ["Q2 FY26", "$30.0B", "+122%", "44%", "net cash", "$7.4B"],
      ["Q3 FY26", "$35.1B", "+94%", "46%", "net cash", "$7.9B"],
      ["Q4 FY26E", "$39.3B", "+78%", "47%", "net cash", "$8.2B"],
    ],
  },
  valuation: {
    cols: ["Multiple", "Current", "5-yr median", "Signal"],
    rows: [
      ["P/E forward", "31.4", "48.6", "bull"],
      ["EV / EBITDA", "27.8", "41.2", "bull"],
      ["PEG ratio", "0.62", "1.40", "bull"],
      ["P / FCF", "38.1", "52.7", "bull"],
    ],
  },
  quality: [
    { label: "Profitability", value: 92, display: "92 / 100" },
    { label: "Balance sheet", value: 88, display: "88 / 100" },
    { label: "Growth durability", value: 96, display: "96 / 100" },
    { label: "Capital allocation", value: 81, display: "81 / 100" },
  ],
};

export const PORT_REPORT = {
  heatmap: {
    labels: ["NVDA", "AAPL", "MSFT", "GOOGL", "AMZN", "META"],
    values: [
      [1.0, 0.52, 0.71, 0.68, 0.63, 0.58],
      [0.52, 1.0, 0.61, 0.66, 0.69, 0.6],
      [0.71, 0.61, 1.0, 0.74, 0.66, 0.63],
      [0.68, 0.66, 0.74, 1.0, 0.7, 0.67],
      [0.63, 0.69, 0.66, 0.7, 1.0, 0.64],
      [0.58, 0.6, 0.63, 0.67, 0.64, 1.0],
    ],
  },
  factors: [
    { label: "Growth", value: 0.92, display: "+0.92", min: -1, max: 1 },
    { label: "Momentum", value: 0.71, display: "+0.71", min: -1, max: 1 },
    { label: "Quality", value: 0.64, display: "+0.64", min: -1, max: 1 },
    { label: "Size", value: 0.88, display: "+0.88", min: -1, max: 1 },
    { label: "Value", value: -0.55, display: "−0.55", min: -1, max: 1 },
  ],
  sizing: {
    cols: ["Metric", "Value", "Budget", "Status"],
    rows: [
      ["Recommended weight", "4 – 6%", "≤ 8% aggressive", "flat"],
      ["VaR (95%) contribution", "1.9% of portfolio", "≤ 2.5%", "bull"],
      ["Stress: market −10%", "−12.4% on position", "—", "flat"],
      ["Stress: market −20%", "−23.8% on position", "—", "bear"],
      ["Stress: +100 bp rates", "−6.1% on position", "—", "flat"],
    ],
  },
};

export const NEWS_REPORT = {
  mentions: [42, 38, 51, 47, 63, 58, 71, 66, 84, 79, 92, 88, 104, 118],
  sources: [
    { label: "Media & wire", value: 46, display: "46% · 2,140 items" },
    { label: "Social & forums", value: 38, display: "38% · 1,770 items" },
    { label: "Insider filings", value: 9, display: "9% · 418 items" },
    { label: "Regulatory feed", value: 7, display: "7% · 326 items" },
  ],
  headlines: [
    { t: "2h", src: "Reuters", tone: "bull", impact: "High", text: "NVIDIA extends Blackwell Ultra ramp; hyperscaler orders pulled forward." },
    { t: "7h", src: "Bloomberg", tone: "bear", impact: "High", text: "Beijing mulls tighter review of AI-chip bundles, people familiar say." },
    { t: "1d", src: "CNBC", tone: "bull", impact: "Med", text: "Jensen Huang: “We are supply-constrained, not demand-constrained.”" },
    { t: "1d", src: "FT", tone: "bull", impact: "Med", text: "Sovereign-AI deal pipeline grows to $9B, filing shows." },
    { t: "2d", src: "S3 Partners", tone: "bull", impact: "Low", text: "Short interest drifts lower for a third straight week." },
    { t: "3d", src: "SemiAnalysis", tone: "bull", impact: "Med", text: "Rival custom-silicon timelines slip into 2027." },
    { t: "4d", src: "Reuters", tone: "bear", impact: "Med", text: "EU opens inquiry into bundled networking discounts." },
    { t: "5d", src: "Form 4", tone: "flat", impact: "Low", text: "Director sells $4.2M under a pre-scheduled 10b5-1 plan." },
  ] as { t: string; src: string; tone: "bull" | "bear" | "flat"; impact: "High" | "Med" | "Low"; text: string }[],
};

export const EARN_REPORT = {
  quotes: [
    {
      who: "CFO · prepared remarks",
      text: [
        { t: "Blackwell Ultra yields are " },
        { t: "ahead of our internal plan", hl: true },
        { t: ", and we expect " },
        { t: "supply constraints to persist", hl: true },
        { t: " through the fiscal year." },
      ],
    },
    {
      who: "CEO · Q&A on China",
      text: [
        { t: "The export regime is " },
        { t: "workable", hl: true },
        { t: ". Our customers are " },
        { t: "re-designing configurations faster than anticipated", hl: true },
        { t: "." },
      ],
    },
    {
      who: "CFO · Q&A on margins",
      text: [
        { t: "The 74–75% guide " },
        { t: "bakes in the new product mix", hl: true },
        { t: "; we are " },
        { t: "not assuming any pricing relief from memory", hl: true },
        { t: "." },
      ],
    },
  ] as { who: string; text: { t: string; hl?: boolean }[] }[],
  tone: [
    { label: "Evasiveness index", value: 18, display: "18 / 100 (avg 31)" },
    { label: "Positive lexicon share", value: 64, display: "64%" },
    { label: "“Uncertainty” mentions", value: 3, display: "3 (avg 9)", max: 20 },
    { label: "Guidance beats (streak)", value: 80, display: "4 of 4 quarters" },
  ],
  guidance: {
    cols: ["Guide item", "Company", "Consensus", "Delta"],
    rows: [
      ["Revenue, next qtr", "$43.0B", "$41.6B", "+3.4%"],
      ["EPS, next qtr", "$0.92", "$0.88", "+4.5%"],
      ["Gross margin", "74 – 75%", "73.8%", "+0.7 pp"],
      ["OpEx growth YoY", "+19%", "+24%", "tighter"],
    ],
  },
};
