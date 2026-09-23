import logger from '../utils/logger.js';

// Static agent data (matching frontend)
const AGENTS_DATA = [
  {
    id: 'tech',
    name: 'Technical',
    short: 'Technical',
    desc: 'Reads the chart like a language: trend, volume, liquidity at key levels and momentum.',
    price: 5,
    color: '#007AFF',
    tags: ['Candles', 'Levels', 'RSI'],
    speed: '~15 sec',
  },
  {
    id: 'fund',
    name: 'Fundamental',
    short: 'Fundamental',
    desc: 'Takes the financials apart to the last dollar: margins, cash flow, debt load.',
    price: 7,
    color: '#5856D6',
    tags: ['P/E', 'FCF', 'Debt'],
    speed: '~25 sec',
  },
  {
    id: 'port',
    name: 'Portfolio',
    short: 'Portfolio',
    desc: 'Looks at the trade in the context of your portfolio: correlations, risk, weights.',
    price: 6,
    color: '#00C7BE',
    tags: ['Correlation', 'VaR', 'Weight'],
    speed: '~20 sec',
  },
  {
    id: 'news',
    name: 'News',
    short: 'News',
    desc: 'Scans 10,400+ sources in real time and separates signal from noise.',
    price: 4,
    color: '#FF9500',
    tags: ['Media', 'Social', 'Tone'],
    speed: '~10 sec',
  },
  {
    id: 'earn',
    name: 'Earning Calls',
    short: 'Calls',
    desc: 'Listens to management calls: tone, slip-ups, guidance versus consensus.',
    price: 8,
    color: '#FF2D55',
    tags: ['Transcripts', 'Guidance', 'CEO tone'],
    speed: '~30 sec',
  },
];

const AGENT_PAGES = {
  tech: {
    tagline: 'Reads price like a language — structure, liquidity and momentum across five timeframes.',
    stats: [
      { k: 'indicators tracked', v: '200+' },
      { k: 'timeframes, 1H to 1M', v: '5' },
      { k: 'liquidity maps', v: '3' },
      { k: 'per run', v: '~15 sec' },
    ],
    reads: [
      { icon: 'gauge', title: 'Candlestick history', text: 'Adjusted OHLCV from 1-hour to monthly, splits and dividends normalized.' },
      { icon: 'layers', title: 'Volume & liquidity profile', text: 'Where size actually trades — volume nodes, resting liquidity, sweep zones.' },
      { icon: 'target', title: 'Order-flow footprints', text: 'Dark-pool prints and block trades that never show on lit exchanges.' },
      { icon: 'bolt', title: 'Volatility surface', text: 'Term structure and skew — what options markets expect next.' },
    ],
    methodology: [
      { title: 'Structure first', text: 'Trend, higher-timeframe levels and market structure are mapped before any oscillator is consulted.' },
      { title: 'Liquidity hunt', text: 'The agent locates pools of stops and resting orders, then checks whether they were swept or respected.' },
      { title: 'Score & scenario', text: 'Momentum, trend and volume votes are weighted into a score, then projected onto bull / base / bear paths.' },
    ],
    strengths: [
      'Early read on momentum shifts via volume divergence',
      'Explicit levels — every claim maps to a price',
      'Multi-timeframe alignment filters out noise',
    ],
    blindSpots: [
      'Blind to fundamentals — a perfect chart can still be an overvalued business',
      'Whipsaws in low-liquidity ranges',
      'Gap events (earnings, macro) can invalidate structure instantly',
    ],
    sample: {
      ticker: 'NVDA',
      date: 'Feb 12, 2026',
      signal: 'bull',
      confidence: 74,
      summary: [
        'Price reclaimed the 200-day moving average on expanding volume; daily structure prints higher highs.',
        'Liquidity swept at 118.4 — the low was taken, stops cleared, and buyers absorbed the offer.',
        'Key battle zone 124–131; a close above 136.8 opens the path to 152 with little overhead supply.',
      ],
    },
  },
  fund: {
    tagline: 'Takes the financials apart to the last dollar — margins, cash flow and the balance sheet.',
    stats: [
      { k: 'of filings parsed', v: '12 yrs' },
      { k: 'ratios per company', v: '43' },
      { k: 'valuation scenarios', v: '6' },
      { k: 'per run', v: '~25 sec' },
    ],
    reads: [
      { icon: 'fund', title: 'SEC filings', text: '10-K, 10-Q and 8-K parsed line by line, including footnotes where risk hides.' },
      { icon: 'target', title: 'Consensus & guidance', text: 'Street estimates versus management guidance, and the drift between the two.' },
      { icon: 'shield', title: 'Capital structure', text: 'Debt stack, maturities, covenants and refinancing risk under higher rates.' },
      { icon: 'spark', title: 'Segment economics', text: 'Unit economics per business line — which engine actually earns the margin.' },
    ],
    methodology: [
      { title: 'Normalize', text: 'One-offs, stock-based comp and accounting noise are stripped to expose real earnings power.' },
      { title: 'Stress the balance sheet', text: 'Cash conversion, debt maturities and covenant headroom are tested against adverse rates.' },
      { title: 'Price vs value', text: 'Multiples are compared to the company\'s own history and sector peers, not to a vacuum.' },
    ],
    strengths: [
      'Catches earnings-quality tricks in the footnotes',
      'Valuation discipline — never chases a story without numbers',
      'Explicit downside case in every report',
    ],
    blindSpots: [
      'Slow to react — filings lag the business by weeks',
      'Discounts narrative-driven re-ratings',
      'Consensus-anchored: can miss truly novel business models',
    ],
    sample: {
      ticker: 'NVDA',
      date: 'Feb 12, 2026',
      signal: 'bull',
      confidence: 81,
      summary: [
        'FCF margin expanded to 46% — the business converts growth into cash, not just revenue.',
        'Forward P/E of 31 sits below the five-year median of 48.6: growth is not fully priced in.',
        'Net-cash balance sheet; buybacks at ~2% of market cap a year quietly support EPS.',
      ],
    },
  },
  port: {
    tagline: 'Judges the trade in context — correlations, factor exposure and what a loss would cost you.',
    stats: [
      { k: 'assets covered', v: '1,200+' },
      { k: 'factor exposures', v: '5' },
      { k: 'Monte-Carlo paths', v: '10K' },
      { k: 'per run', v: '~20 sec' },
    ],
    reads: [
      { icon: 'port', title: 'Your holdings', text: 'The portfolio you optionally share — weights, sectors, factor tilts, concentration.' },
      { icon: 'layers', title: 'Correlation regime', text: 'Rolling correlations, and whether they spike together exactly when you don\'t want them to.' },
      { icon: 'gauge', title: 'Risk models', text: 'VaR, expected shortfall and marginal risk contribution of the new position.' },
      { icon: 'shield', title: 'Stress scenarios', text: '2008, 2020, 2022-style drawdowns replayed against the combined portfolio.' },
    ],
    methodology: [
      { title: 'Map the overlap', text: 'The candidate is decomposed into factors and compared to what you already own.' },
      { title: 'Measure the tail', text: '10,000 simulated paths estimate how the position behaves in the worst weeks, not the average ones.' },
      { title: 'Size it', text: 'A recommended weight band keeps the position inside the portfolio\'s risk budget.' },
    ],
    strengths: [
      'Turns "good stock" into "good position for you"',
      'Quantifies the cost of concentration',
      'Explicit sizing band, not vague conviction',
    ],
    blindSpots: [
      'Garbage in, garbage out — needs honest portfolio data',
      'Historical correlations break in novel crises',
      'Says nothing about the business itself',
    ],
    sample: {
      ticker: 'NVDA',
      date: 'Feb 12, 2026',
      signal: 'flat',
      confidence: 63,
      summary: [
        'Correlation with the existing tech core is 0.74 — the position adds exposure, not diversification.',
        'At a 5% weight, 95% VaR contribution is 1.9% of portfolio value — inside the risk budget.',
        'In a −20% market scenario the position would add ~2.7 pp of extra drawdown.',
      ],
    },
  },
  news: {
    tagline: 'Scans 10,400+ sources in real time and separates signal from noise.',
    stats: [
      { k: 'sources live', v: '10,400+' },
      { k: 'languages parsed', v: '92' },
      { k: 'headline latency', v: '40 ms' },
      { k: 'per run', v: '~10 sec' },
    ],
    reads: [
      { icon: 'news', title: 'Wire services & media', text: 'Reuters, Bloomberg, FT and 300+ outlets, de-duplicated and clustered by event.' },
      { icon: 'spark', title: 'Social & forums', text: 'Retail flow of narratives — surges, sentiment flips and coordinated campaigns.' },
      { icon: 'lock', title: 'Insider filings', text: 'Form 4 transactions matched against 10b5-1 plans to filter routine sales.' },
      { icon: 'shield', title: 'Regulatory feed', text: 'DOJ, SEC, EU and export-control dockets the moment they move.' },
    ],
    methodology: [
      { title: 'Cluster events', text: 'Thousands of headlines collapse into distinct events, each scored for novelty and reach.' },
      { title: 'Weigh the source', text: 'A Bloomberg exclusive outweighs a recycled blog post; weight follows track record.' },
      { title: 'Separate flow from noise', text: 'Persistent sentiment drift is signal; one-off viral spikes are usually noise.' },
    ],
    strengths: [
      'Fastest agent — catches catalysts within minutes',
      'Source-weighted, not headline-counted',
      'Flags regulatory risk before it hits the price',
    ],
    blindSpots: [
      'Can overreact to a single large outlet',
      'Irony and satire occasionally survive parsing',
      'Says nothing about whether the news is priced in',
    ],
    sample: {
      ticker: 'NVDA',
      date: 'Feb 12, 2026',
      signal: 'bull',
      confidence: 68,
      summary: [
        'Sentiment 78% positive over 72 hours, driven by Blackwell Ultra supply updates — no negative spikes.',
        'Mentions doubled week over week without hysteria: interest is rising, not panicking.',
        'One open risk: the EU networking-discount inquiry is gaining reach in tier-one press.',
      ],
    },
  },
  earn: {
    tagline: 'Listens to management calls — tone, slip-ups and guidance versus consensus.',
    stats: [
      { k: 'transcripts archived', v: '28' },
      { k: 'calls cross-analyzed', v: '4' },
      { k: 'tone markers', v: '190' },
      { k: 'per run', v: '~30 sec' },
    ],
    reads: [
      { icon: 'earn', title: 'Earnings transcripts', text: 'The last four quarters of prepared remarks and unscripted Q&A, word by word.' },
      { icon: 'gauge', title: 'Tone analytics', text: 'Hedging density, evasiveness index and sentiment shift between remarks and Q&A.' },
      { icon: 'target', title: 'Guidance vs consensus', text: 'Every guide item compared to street estimates at the moment it was given.' },
      { icon: 'layers', title: 'Cross-call patterns', text: 'Phrases that reappear, disappear or change meaning from call to call.' },
    ],
    methodology: [
      { title: 'Read between the lines', text: 'What management declines to repeat is often louder than what they say.' },
      { title: 'Q&A over script', text: 'Prepared remarks are polished; analyst Q&A is where confidence is tested.' },
      { title: 'Track the drift', text: 'Guidance language is compared across quarters to catch quiet de-risking early.' },
    ],
    strengths: [
      'Detects de-risking language quarters before guidance cuts',
      'Quantifies tone — not vibes',
      'Holds management accountable to prior promises',
    ],
    blindSpots: [
      'Great actors can pass a tone test',
      'Only as frequent as the earnings calendar',
      'Sector jargon can mask meaning from any parser',
    ],
    sample: {
      ticker: 'NVDA',
      date: 'Feb 12, 2026',
      signal: 'bull',
      confidence: 77,
      summary: [
        'Guidance raised 3.4% above consensus — the fourth consecutive beat on the guide itself.',
        'Evasiveness index at 18/100, down from 31 a year ago; Q&A answers got more specific.',
        'The margin guide bakes in new-product mix without assuming memory pricing relief — conservative.',
      ],
    },
  },
};

export class AgentsService {
  getAllAgents() {
    logger.debug('AgentsService: Getting all agents');
    return AGENTS_DATA;
  }

  getAgentById(id: string) {
    logger.debug('AgentsService: Getting agent by id', { id });
    const agent = AGENTS_DATA.find(a => a.id === id);
    if (!agent) {
      throw new Error('Agent not found');
    }
    return agent;
  }

  getAgentProfile(id: string) {
    logger.debug('AgentsService: Getting agent profile', { id });
    const agent = AGENTS_DATA.find(a => a.id === id);
    const profile = AGENT_PAGES[id as keyof typeof AGENT_PAGES];
    
    if (!agent || !profile) {
      throw new Error('Agent not found');
    }

    return { ...agent, ...profile };
  }
}

export const agentsService = new AgentsService();
