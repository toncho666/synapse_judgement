import React from 'react';
import { useNewsAnalysis } from '../hooks/useNewsAnalysis';

interface NewsAnalysisPanelProps {
  ticker: string;
}

const NewsAnalysisPanel: React.FC<NewsAnalysisPanelProps> = ({ ticker }) => {
  const { analysis, loading, error, refetch } = useNewsAnalysis(ticker);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing news for {ticker}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={refetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bull': return 'bg-green-500 text-white';
      case 'bear': return 'bg-red-500 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSentiment = (score: number) => {
    return score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analysis.ticker} - News Analysis</h2>
          <p className="text-gray-500 text-sm">
            Period: {analysis.period} • {new Date(analysis.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${getSignalColor(analysis.signal)}`}>
            {analysis.signal.toUpperCase()}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Strength: {analysis.strength}%
          </p>
        </div>
      </div>

      {/* Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-lg p-4 ${getSentimentColor(analysis.sentiment.label)}`}>
          <p className="text-sm font-semibold mb-1">Overall Sentiment</p>
          <p className="text-3xl font-bold">{formatSentiment(analysis.sentiment.score)}</p>
          <p className="text-xs mt-1">
            {getTrendIcon(analysis.sentiment.trend)} {analysis.sentiment.trend}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm font-semibold mb-2 text-gray-700">News Breakdown</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-green-600">Positive:</span>
              <span className="font-semibold">{analysis.statistics.positive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Negative:</span>
              <span className="font-semibold">{analysis.statistics.negative}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Neutral:</span>
              <span className="font-semibold">{analysis.statistics.neutral}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <p className="text-sm font-semibold mb-2 text-gray-700">Statistics</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Total News:</span>
              <span className="font-semibold">{analysis.statistics.totalNews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Positivity Ratio:</span>
              <span className="font-semibold">{analysis.statistics.positivityRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-semibold">{analysis.sentiment.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Sentiment Over Time</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Last 24h</p>
            <p className="text-xl font-bold text-gray-900">
              {formatSentiment(analysis.timeAnalysis.last24h.score)}
            </p>
            <p className="text-xs text-gray-500">{analysis.timeAnalysis.last24h.count} articles</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Last 3d</p>
            <p className="text-xl font-bold text-gray-900">
              {formatSentiment(analysis.timeAnalysis.last3d.score)}
            </p>
            <p className="text-xs text-gray-500">{analysis.timeAnalysis.last3d.count} articles</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Last 5d</p>
            <p className="text-xl font-bold text-gray-900">
              {formatSentiment(analysis.timeAnalysis.last5d.score)}
            </p>
            <p className="text-xs text-gray-500">{analysis.timeAnalysis.last5d.count} articles</p>
          </div>
        </div>
      </div>

      {/* Key Events */}
      {analysis.keyEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
          <div className="space-y-2">
            {analysis.keyEvents.map((event, idx) => (
              <div key={idx} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{event.source}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.time).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getImpactColor(event.impact)}`}>
                        {event.impact} impact
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${event.sentiment > 0 ? 'text-green-600' : event.sentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatSentiment(event.sentiment)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Sources */}
      {analysis.topSources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Top Sources</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {analysis.topSources.map((source, idx) => (
              <div key={idx} className="border rounded-lg p-2 text-center">
                <p className="text-xs font-semibold text-gray-900 truncate">{source.name}</p>
                <p className="text-xs text-gray-500">{source.count} articles</p>
                <p className={`text-xs font-bold ${source.avgSentiment > 0 ? 'text-green-600' : source.avgSentiment < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {formatSentiment(source.avgSentiment)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signal Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Signal Explanation</h3>
        <ul className="space-y-1">
          {analysis.reasons.map((reason, idx) => (
            <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default NewsAnalysisPanel;
