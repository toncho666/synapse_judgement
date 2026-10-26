import { useState, useEffect } from 'react';

interface EarningsTone {
  evasivenessIndex: number;
  confidenceScore: number;
  sentimentShift: number;
  overallTone: 'confident' | 'cautious' | 'uncertain';
}

interface EarningsGuidance {
  companyGuidance: {
    eps?: number;
    revenue?: number;
  };
  consensusEstimate: {
    eps?: number;
    revenue?: number;
  };
  beat: boolean;
  delta: number;
}

interface EarningsTopic {
  topic: string;
  count: number;
  sentiment: number;
}

interface EarningsQuote {
  speaker: string;
  title: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  quarter: string;
}

interface QuarterlyTrend {
  quarter: string;
  confidence: number;
  evasiveness: number;
  sentiment: number;
}

interface EarningsAnalysis {
  ticker: string;
  timestamp: string;
  period: string;
  tone: EarningsTone;
  guidance: EarningsGuidance;
  keyTopics: EarningsTopic[];
  keyQuotes: EarningsQuote[];
  quarterlyTrend: QuarterlyTrend[];
  signal: 'bull' | 'bear' | 'flat';
  strength: number;
  reasons: string[];
}

interface UseEarningsCallResult {
  analysis: EarningsAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEarningsCall(ticker: string): UseEarningsCallResult {
  const [analysis, setAnalysis] = useState<EarningsAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!ticker) {
      setAnalysis(null);
      return;
    }

    // Validate ticker format
    const tickerRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
    if (!tickerRegex.test(ticker)) {
      setError('Invalid ticker format. Use letters only (e.g., AAPL, MSFT)');
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/earnings-call/${ticker}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticker ${ticker} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch earnings call analysis');
      }
    } catch (err) {
      console.error('Error fetching earnings call analysis:', err);
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
