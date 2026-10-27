// API service for backend calls
import type { AgentId, SessionResult } from './engine';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Run analysis via backend API
 * Returns real data from backend instead of mock data
 */
export async function runAnalysisAPI(
  ticker: string,
  agents: AgentId[],
  portfolio?: number
): Promise<SessionResult> {
  try {
    // Get auth token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/analysis/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ticker,
        agents,
        portfolio: portfolio || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Analysis failed');
    }

    // Wait for analysis to complete (backend processes async)
    const sessionId = data.data.sessionId;
    
    // Poll for results
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const statusResponse = await fetch(`${API_BASE_URL}/analysis/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`Failed to get analysis status: ${statusResponse.status}`);
      }
      
      const statusData = await statusResponse.json();
      
      if (!statusData.success) {
        throw new Error(statusData.error || 'Failed to get analysis status');
      }
      
      const session = statusData.data;
      
      if (session.status === 'COMPLETED') {
        // Transform backend response to frontend SessionResult format
        return {
          ticker: session.ticker,
          session: session.id,
          basePrice: session.basePrice,
          target: session.targetPrice,
          agents: session.agentVerdicts.map((v: any) => ({
            agentId: v.agentId,
            signal: v.signal.toLowerCase() as 'bull' | 'bear' | 'flat',
            score: v.score,
            confidence: v.confidence,
            lines: v.lines,
            metrics: v.metrics,
          })),
          composite: session.composite,
          verdict: session.verdict,
          verdictWord: session.verdictWord,
          verdictConfidence: session.confidence,
          consensus: {
            bull: session.consensusBull,
            flat: session.consensusFlat,
            bear: session.consensusBear,
          },
          rationale: session.rationale,
        };
      } else if (session.status === 'FAILED') {
        throw new Error('Analysis failed on backend');
      }
      
      attempts++;
    }
    
    throw new Error('Analysis timeout - backend took too long to complete');
    
  } catch (error) {
    console.error('Error running analysis via API:', error);
    throw error;
  }
}
