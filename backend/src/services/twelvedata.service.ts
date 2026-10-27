// Twelve Data API client
// Used for: historical OHLC data (technical analysis) and current stock quotes.
// Free tier: 800 credits/day, 8 requests/minute -> we serialize calls with a queue
// and enforce a minimum interval between requests.

export function getTwelveDataApiKey(): string {
  return (process.env.TWELVEDATA_API_KEY || '').trim();
}

// ---- Simple sequential rate limiter (shared by all Twelve Data calls) ----
let tdLastCallAt = 0;
const TD_MIN_INTERVAL_MS = 8000; // ~7.5 req/min to stay under the free-tier 8 req/min limit
let tdQueueTail: Promise<void> = Promise.resolve();

async function twelveDataSlot<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const run = tdQueueTail.then(async () => {
    const wait = tdLastCallAt + TD_MIN_INTERVAL_MS - Date.now();
    if (wait > 0) {
      console.log(`⏱️ Rate-limiting Twelve Data request (${label}): waiting ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
    tdLastCallAt = Date.now();
    return fn();
  });
  // Keep the chain alive even if this call rejects
  tdQueueTail = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

interface TdResponse {
  status: string;
  code?: number;
  message?: string;
  [key: string]: any;
}

async function tdFetch(url: string, label: string): Promise<TdResponse | null> {
  const apiKey = getTwelveDataApiKey();
  if (!apiKey) {
    console.warn(
      `⚠️  TWELVEDATA_API_KEY is not set - cannot fetch "${label}" from Twelve Data. ` +
        `Get a free key at https://twelvedata.com/pricing and add it to backend/.env`
    );
    return null;
  }

  try {
    const doFetch = async (): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      try {
        return await fetch(`${url}&apikey=${apiKey}`, { signal: controller.signal });
      } finally {
        clearTimeout(timeoutId);
      }
    };

    let response: Response;
    try {
      response = await twelveDataSlot(label, doFetch);
    } catch (fetchError) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error(`❌ Timeout fetching from Twelve Data: ${label} (15s)`);
      } else {
        console.error(`❌ Network error fetching from Twelve Data: ${label}`, fetchError);
      }
      return null;
    }

    if (!response.ok) {
      console.warn(`⚠️  Twelve Data HTTP error for ${label}: ${response.status}`);
      if (response.status === 429) {
        console.warn(`💡 Twelve Data rate limit hit (free tier: 8 req/min, 800 credits/day).`);
      }
      return null;
    }

    const data = (await response.json()) as TdResponse;

    // Twelve Data returns { status: "error", code, message } on failures (bad symbol, quota, ...)
    if (data.status === 'error') {
      console.error(`❌ Twelve Data API error for ${label}: [${data.code}] ${data.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`❌ Failed to fetch from Twelve Data: ${label}`, error);
    return null;
  }
}

// ============ HISTORICAL DATA (for technical analysis) ============

export interface OhlcSeries {
  opens: number[];
  highs: number[];
  lows: number[];
  closes: number[];
  volumes: number[];
}

/**
 * Fetch daily OHLC history for a ticker (oldest -> newest).
 * @param days number of trading days to request (max 5000 on paid plans; free supports up to full range per call within credit limits)
 */
export async function fetchHistoricalDaily(ticker: string, days = 350): Promise<OhlcSeries | null> {
  console.log(`🌐 Fetching historical data for ${ticker} from Twelve Data...`);

  const url =
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(ticker)}` +
    `&interval=1day&outputsize=${days}&order=ASC&format=JSON`;

  const data = await tdFetch(url, `time_series ${ticker}`);
  if (!data) return null;

  // Response: { meta, values: [{ datetime, open, high, low, close, volume }, ...] } or { symbol, values: [...] }
  const values: any[] = data.values;
  if (!Array.isArray(values) || values.length === 0) {
    console.warn(`⚠️  Twelve Data returned no historical values for ${ticker}`);
    if (typeof data.message === 'string') console.warn(`   Message: ${data.message}`);
    return null;
  }

  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  const volumes: number[] = [];

  for (const v of values) {
    const o = parseFloat(v.open);
    const h = parseFloat(v.high);
    const l = parseFloat(v.low);
    const c = parseFloat(v.close);
    const vol = parseInt(v.volume ?? '0', 10);
    if ([o, h, l, c].some((n) => Number.isNaN(n))) continue;
    opens.push(o);
    highs.push(h);
    lows.push(l);
    closes.push(c);
    volumes.push(Number.isNaN(vol) ? 0 : vol);
  }

  if (closes.length === 0) {
    console.warn(`⚠️  Could not parse any OHLC rows for ${ticker}`);
    return null;
  }

  const latestPrice = closes[closes.length - 1];
  console.log(
    `✅ Fetched REAL historical data for ${ticker} from Twelve Data: ${closes.length} days, latest close: $${latestPrice.toFixed(2)}`
  );

  return { opens, highs, lows, closes, volumes };
}

// ============ CURRENT QUOTES (for stocks dashboard / analysis price) ============

export interface TwelveQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface RawQuoteValue {
  symbol?: string;
  close?: string | number;
  percent_change?: string | number;
  change?: string | number;
  previous_close?: string | number;
  price?: string | number; // some endpoints use "price" instead of "close"
}

function normalizeQuote(item: RawQuoteValue, fallbackSymbol: string): TwelveQuote | null {
  const price = parseFloat((item.close ?? item.price) as any);
  if (Number.isNaN(price) || price <= 0) return null;

  const changePercent = parseFloat(item.percent_change as any);
  const explicitChange = parseFloat(item.change as any);
  const prevClose = parseFloat(item.previous_close as any);

  let change = explicitChange;
  if (Number.isNaN(change)) {
    if (!Number.isNaN(prevClose)) change = price - prevClose;
    else if (!Number.isNaN(changePercent)) change = (price * changePercent) / 100;
    else change = 0;
  }

  return {
    symbol: item.symbol || fallbackSymbol,
    price,
    change: Number.isNaN(change) ? 0 : change,
    changePercent: Number.isNaN(changePercent) ? 0 : changePercent,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Fetch a single current quote from Twelve Data.
 */
export async function fetchQuote(symbol: string): Promise<TwelveQuote | null> {
  console.log(`📊 Fetching quote for ${symbol} from Twelve Data...`);

  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}`;
  const data = await tdFetch(url, `quote ${symbol}`);
  if (!data) return null;

  // Single-symbol response: { meta, symbol, status, values: { open, high, low, close, ... } }
  const rawValues = data.values;
  if (!rawValues || typeof rawValues !== 'object') {
    console.warn(`⚠️  No quote data for ${symbol} from Twelve Data`);
    return null;
  }

  const quote = normalizeQuote({ ...rawValues, symbol: data.meta?.symbol || symbol }, symbol);
  if (!quote) {
    console.warn(`⚠️  Could not parse quote for ${symbol}`);
    return null;
  }

  console.log(
    `✅ ${symbol}: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`
  );
  return quote;
}

/**
 * Fetch multiple quotes in ONE request (multi-symbol support), then chunk requests
 * to respect the free-tier limits. Returns quotes only for symbols that succeeded.
 */
export async function fetchQuotes(symbols: string[]): Promise<TwelveQuote[]> {
  if (symbols.length === 0) return [];

  const CHUNK_SIZE = 8; // keep each request small; 1 request covers up to 8 symbols
  const results: TwelveQuote[] = [];

  for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
    const chunk = symbols.slice(i, i + CHUNK_SIZE);
    console.log(`📊 Fetching ${chunk.length} quotes from Twelve Data: ${chunk.join(', ')}`);

    const url = `https://api.twelvedata.com/quote?symbol=${chunk.map(encodeURIComponent).join(',')}`;
    const data = await tdFetch(url, `quote ${chunk.join(',')}`);
    if (!data) continue;

    // Multi-symbol response: { AAPL: { status, values: {...} }, NVDA: {...}, ... }
    // Single-symbol response: { meta, values: {...} }
    if (data.values && typeof data.values === 'object' && !Array.isArray(data.values)) {
      const q = normalizeQuote({ ...data.values, symbol: data.meta?.symbol || chunk[0] }, chunk[0]);
      if (q) results.push(q);
      continue;
    }

    for (const symbol of chunk) {
      const entry = data[symbol];
      if (!entry || entry.status === 'error' || !entry.values) {
        console.warn(`⚠️  No quote data for ${symbol} from Twelve Data`);
        continue;
      }
      const q = normalizeQuote({ ...entry.values, symbol }, symbol);
      if (q) results.push(q);
      else console.warn(`⚠️  Could not parse quote for ${symbol}`);
    }
  }

  return results;
}
