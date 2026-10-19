import { useState, useEffect } from 'react';

interface TechnicalSignal {
  type: 'bull' | 'bear' | 'flat';
  strength: number;
  reasons: string[];
}

interface TechnicalIndicators {
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema12: number | null;
  ema26: number | null;
  rsi14: number | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  stochastic: { k: number; d: number } | null;
  adx: number | null;
  bollingerBands: { upper: number; middle: number; lower: number } | null;
  atr14: number | null;
  obv: number | null;
  obvChange: number | null;
}

interface TechnicalAnalysis {
  ticker: string;
  timestamp: string;
  currentPrice: number;
  indicators: TechnicalIndicators;
  signals: {
    trend: TechnicalSignal;
    momentum: TechnicalSignal;
    volatility: TechnicalSignal;
    volume: TechnicalSignal;
    overall: TechnicalSignal;
  };
  support: number | null;
  resistance: number | null;
  recommendation: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
}

interface UseTechnicalAnalysisResult {
  analysis: TechnicalAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTechnicalAnalysis(ticker: string): UseTechnicalAnalysisResult {
  const [analysis, setAnalysis] = useState<TechnicalAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!ticker) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3001/api/technical-analysis/${ticker}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch analysis');
      }
    } catch (err) {
      console.error('Error fetching technical analysis:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [ticker]);

  return {
    analysis,
    loading,
    error,
    refetch: fetchAnalysis,
  };
}
