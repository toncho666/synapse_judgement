import React from 'react';
import { useEarningsCall } from '../hooks/useEarningsCall';

interface EarningsCallPanelProps {
  ticker: string;
}

const EarningsCallPanel: React.FC<EarningsCallPanelProps> = ({ ticker }) => {
  const { analysis, loading, error, refetch } = useEarningsCall(ticker);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing earnings calls for {ticker}...</p>
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

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'confident': return 'text-green-600 bg-green-50 border-green-200';
      case 'cautious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'uncertain': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bull': return 'bg-green-500 text-white';
      case 'bear': return 'bg-red-500 text-white';
      default: return 'bg-yellow-500 text-white';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analysis.ticker} - Earnings Call Analysis</h2>
          <p className="text-gray-500 text-sm">
            {analysis.period} • Updated: {new Date(analysis.timestamp).toLocaleString()}
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

      {/* Tone Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Management Tone</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border rounded-lg p-4 ${getToneColor(analysis.tone.overallTone)}`}>
            <p className="text-sm font-semibold mb-1">Overall Tone</p>
            <p className="text-2xl font-bold capitalize">{analysis.tone.overallTone}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <p className="text-sm font-semibold mb-1">Confidence Score</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.tone.confidenceScore}/100</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysis.tone.confidenceScore}%` }}
              ></div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <p className="text-sm font-semibold mb-1">Evasiveness Index</p>
            <p className="text-2xl font-bold text-gray-900">{analysis.tone.evasivenessIndex}/100</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysis.tone.evasivenessIndex}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 border rounded-lg p-4">
          <p className="text-sm font-semibold mb-1">Sentiment Shift (vs Previous Quarter)</p>
          <p className={`text-2xl font-bold ${analysis.tone.sentimentShift >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {analysis.tone.sentimentShift >= 0 ? '+' : ''}{analysis.tone.sentimentShift}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {analysis.tone.sentimentShift > 10 ? '📈 Improving' : 
             analysis.tone.sentimentShift < -10 ? '📉 Declining' : 
             '➡️ Stable'}
          </p>
        </div>
      </div>

      {/* Guidance vs Consensus */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Guidance vs Consensus</h3>
        <div className="border rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Company Guidance</p>
              {analysis.guidance.companyGuidance.eps && (
                <p className="text-lg font-semibold">EPS: ${analysis.guidance.companyGuidance.eps.toFixed(2)}</p>
              )}
              {analysis.guidance.companyGuidance.revenue && (
                <p className="text-lg font-semibold">Revenue: ${analysis.guidance.companyGuidance.revenue.toFixed(1)}B</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Consensus Estimate</p>
              {analysis.guidance.consensusEstimate.eps && (
                <p className="text-lg font-semibold">EPS: ${analysis.guidance.consensusEstimate.eps.toFixed(2)}</p>
              )}
              {analysis.guidance.consensusEstimate.revenue && (
                <p className="text-lg font-semibold">Revenue: ${analysis.guidance.consensusEstimate.revenue.toFixed(1)}B</p>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                {analysis.guidance.beat ? '✅ Beat Consensus' : '❌ Missed Consensus'}
              </span>
              <span className={`text-lg font-bold ${analysis.guidance.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.guidance.delta >= 0 ? '+' : ''}{analysis.guidance.delta.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quarterly Trend */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quarterly Trend</h3>
        <div className="space-y-2">
          {analysis.quarterlyTrend.map((quarter, idx) => (
            <div key={idx} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{quarter.quarter}</span>
                <span className={`text-sm font-bold ${quarter.sentiment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {quarter.sentiment >= 0 ? '+' : ''}{quarter.sentiment}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Confidence</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${quarter.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Evasiveness</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-orange-600 h-1.5 rounded-full"
                      style={{ width: `${quarter.evasiveness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Topics */}
      {analysis.keyTopics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Topics Discussed</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {analysis.keyTopics.map((topic, idx) => (
              <div key={idx} className="border rounded-lg p-3 text-center">
                <p className="text-sm font-semibold text-gray-900">{topic.topic}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{topic.count}x</p>
                <p className={`text-xs mt-1 ${topic.sentiment > 0 ? 'text-green-600' : topic.sentiment < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                  {topic.sentiment > 0 ? '📈' : topic.sentiment < 0 ? '📉' : '➡️'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Quotes */}
      {analysis.keyQuotes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Quotes</h3>
          <div className="space-y-3">
            {analysis.keyQuotes.map((quote, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{quote.speaker}</p>
                    <p className="text-xs text-gray-500">{quote.title} • {quote.quarter}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(quote.confidence)}`}>
                    {quote.confidence} confidence
                  </span>
                </div>
                <p className="text-sm text-gray-700 italic">"{quote.text}"</p>
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

export default EarningsCallPanel;
