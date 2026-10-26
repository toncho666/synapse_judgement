import { useState, useEffect } from 'react';

interface NewsSentiment {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  trend: 'improving' | 'declining' | 'stable';
  confidence: number;
}

interface NewsStatistics {
  totalNews: number;
  positive: number;
  negative: number;
  neutral: number;
  positivityRatio: number;
}

interface TimeAnalysis {
  last24h: { score: number; count: number };
  last3d: { score: number; count: number };
  last5d: { score: number; count: number };
}

interface KeyEvent {
  title: string;
  sentiment: number;
  source: string;
  time: string;
  impact: 'high' | 'medium' | 'low';
  url: string;
}

interface TopSource {
  name: string;
  count: number;
  avgSentiment: number;
}

interface NewsAnalysis {
  ticker: string;
  period: string;
  timestamp: string;
  sentiment: NewsSentiment;
  statistics: NewsStatistics;
  timeAnalysis: TimeAnalysis;
  keyEvents: KeyEvent[];
  topSources: TopSource[];
  signal: 'bull' | 'bear' | 'flat';
  strength: number;
  reasons: string[];
}

interface UseNewsAnalysisResult {
  analysis: NewsAnalysis | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNewsAnalysis(ticker: string): UseNewsAnalysisResult {
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
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
      // Use relative path (Vite proxy)
      const response = await fetch(`/api/news-analysis/${ticker}`);

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
        throw new Error(data.error || 'Failed to fetch news analysis');
      }
    } catch (err) {
      console.error('Error fetching news analysis:', err);
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
