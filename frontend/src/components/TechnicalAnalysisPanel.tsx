import React from 'react';
import { useTechnicalAnalysis } from '../hooks/useTechnicalAnalysis';

interface TechnicalAnalysisPanelProps {
  ticker: string;
}

const TechnicalAnalysisPanel: React.FC<TechnicalAnalysisPanelProps> = ({ ticker }) => {
  const { analysis, loading, error, refetch } = useTechnicalAnalysis(ticker);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing {ticker}...</p>
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

  const getSignalColor = (type: 'bull' | 'bear' | 'flat') => {
    switch (type) {
      case 'bull': return 'text-green-600 bg-green-50 border-green-200';
      case 'bear': return 'text-red-600 bg-red-50 border-red-200';
      case 'flat': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSignalIcon = (type: 'bull' | 'bear' | 'flat') => {
    switch (type) {
      case 'bull': return '📈';
      case 'bear': return '📉';
      case 'flat': return '➡️';
    }
  };

  const getRecommendationColor = (rec: 'BUY' | 'HOLD' | 'SELL') => {
    switch (rec) {
      case 'BUY': return 'bg-green-500 text-white';
      case 'SELL': return 'bg-red-500 text-white';
      case 'HOLD': return 'bg-yellow-500 text-white';
    }
  };

  const formatNumber = (num: number | null, decimals: number = 2) => {
    if (num === null) return 'N/A';
    return num.toFixed(decimals);
  };

  const formatPrice = (num: number | null) => {
    if (num === null) return 'N/A';
    return `$${num.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{analysis.ticker}</h2>
          <p className="text-gray-500 text-sm">
            Technical Analysis • {new Date(analysis.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">{formatPrice(analysis.currentPrice)}</p>
          <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg ${getRecommendationColor(analysis.recommendation)}`}>
            {analysis.recommendation}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Confidence: {analysis.confidence.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Support & Resistance */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-semibold">Support Level</p>
          <p className="text-2xl font-bold text-green-900">{formatPrice(analysis.support)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-semibold">Resistance Level</p>
          <p className="text-2xl font-bold text-red-900">{formatPrice(analysis.resistance)}</p>
        </div>
      </div>

      {/* Signals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Trading Signals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analysis.signals).map(([key, signal]) => (
            <div
              key={key}
              className={`border rounded-lg p-4 ${getSignalColor(signal.type)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold capitalize">{key}</h4>
                <span className="text-2xl">{getSignalIcon(signal.type)}</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Strength</span>
                  <span className="font-bold">{signal.strength.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      signal.type === 'bull' ? 'bg-green-500' :
                      signal.type === 'bear' ? 'bg-red-500' : 'bg-gray-500'
                    }`}
                    style={{ width: `${signal.strength}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-xs space-y-1">
                {signal.reasons.slice(0, 3).map((reason, idx) => (
                  <p key={idx} className="text-gray-700">• {reason}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Indicators */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">RSI (14)</p>
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(analysis.indicators.rsi14)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">SMA 20</p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(analysis.indicators.sma20)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">SMA 50</p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(analysis.indicators.sma50)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">SMA 200</p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(analysis.indicators.sma200)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">MACD</p>
            <p className="text-lg font-bold text-gray-900">
              {analysis.indicators.macd ? formatNumber(analysis.indicators.macd.histogram) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">ATR (14)</p>
            <p className="text-lg font-bold text-gray-900">
              {formatNumber(analysis.indicators.atr14)}
            </p>
          </div>
        </div>
      </div>

      {/* Bollinger Bands */}
      {analysis.indicators.bollingerBands && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bollinger Bands</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Upper Band</span>
              <span className="font-bold text-red-600">
                {formatPrice(analysis.indicators.bollingerBands.upper)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Middle Band</span>
              <span className="font-bold text-gray-900">
                {formatPrice(analysis.indicators.bollingerBands.middle)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lower Band</span>
              <span className="font-bold text-green-600">
                {formatPrice(analysis.indicators.bollingerBands.lower)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Volume Analysis */}
      {analysis.indicators.obv !== null && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Volume Analysis</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">OBV</span>
              <span className="font-bold text-gray-900">
                {analysis.indicators.obv.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">OBV Change</span>
              <span className={`font-bold ${
                analysis.indicators.obvChange! > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analysis.indicators.obvChange!.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      )}

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

export default TechnicalAnalysisPanel;
