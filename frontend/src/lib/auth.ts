export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  plan: 'free' | 'pro' | 'enterprise';
  credits: number;
  referralCode: string;
  createdAt: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface Session {
  id: string;
  ticker: string;
  agents: string[];
  verdict: 'BUY' | 'HOLD' | 'SELL';
  confidence: number;
  timestamp: string;
  cost: number;
  targetPrice: number;
  currentPrice: number;
  accuracy?: number;
}

const STORAGE_KEYS = {
  USER: 'synapse_user',
  SESSIONS: 'synapse_sessions',
};

const API_BASE_URL = 'http://localhost:3001';

/** Normalizes backend plan (FREE/PRO/ENTERPRISE) to the frontend format. */
function normalizePlan(plan: string | undefined): User['plan'] {
  switch ((plan || '').toUpperCase()) {
    case 'PRO': return 'pro';
    case 'ENTERPRISE': return 'enterprise';
    default: return 'free';
  }
}

/** Maps a user object returned by the backend API to the frontend User shape. */
function mapApiUser(apiUser: any): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    avatar: apiUser.avatar || '🚀',
    plan: normalizePlan(apiUser.plan),
    credits: apiUser.credits ?? 0,
    referralCode: apiUser.referralCode || '',
    createdAt: apiUser.createdAt || new Date().toISOString(),
    achievements: apiUser.achievements || [],
  };
}

const MOCK_SESSIONS: Session[] = [
  { id: 's1', ticker: 'AAPL', agents: ['Technical', 'Fundamental', 'News'], verdict: 'BUY', confidence: 87, timestamp: '2026-01-20T14:30:00Z', cost: 16, targetPrice: 245.50, currentPrice: 238.20, accuracy: 94 },
  { id: 's2', ticker: 'TSLA', agents: ['Technical', 'Earning Calls'], verdict: 'HOLD', confidence: 72, timestamp: '2026-01-19T09:15:00Z', cost: 13, targetPrice: 268.00, currentPrice: 252.40, accuracy: 88 },
  { id: 's3', ticker: 'NVDA', agents: ['Technical', 'Fundamental', 'Portfolio', 'News', 'Earning Calls'], verdict: 'BUY', confidence: 91, timestamp: '2026-01-18T16:45:00Z', cost: 30, targetPrice: 1180.00, currentPrice: 1042.10, accuracy: 96 },
];

export function getUser(): User | null {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (stored) return JSON.parse(stored);
  return null;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

async function requestAuth(endpoint: string, payload: object): Promise<User> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Server returned an invalid response');
  }

  if (!response.ok) {
    const details = Array.isArray(data?.details) && data.details.length > 0
      ? `: ${data.details.map((d: any) => d.message).join(', ')}`
      : '';
    throw new Error((data?.error || 'Authentication failed') + details);
  }

  // Сохраняем JWT-токен и пользователя под едиными ключами
  localStorage.setItem('token', data.token);
  const user = mapApiUser(data.user);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

export async function login(email: string, password: string): Promise<User> {
  return requestAuth('/api/auth/login', { email, password });
}

export async function register(email: string, name: string, password: string): Promise<User> {
  return requestAuth('/api/auth/register', { email, name, password });
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getSessions(): Session[] {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(MOCK_SESSIONS));
  return MOCK_SESSIONS;
}

export function upgradePlan(plan: 'pro' | 'enterprise'): User | null {
  const user = getUser();
  if (!user) return null;
  
  user.plan = plan;
  if (plan === 'pro') {
    user.credits += 500;
  } else if (plan === 'enterprise') {
    user.credits += 2000;
  }
  
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
}

export function getStats() {
  const sessions = getSessions();
  const user = getUser();
  
  const totalSessions = sessions.length;
  const totalSpent = sessions.reduce((sum, s) => sum + s.cost, 0);
  const avgConfidence = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.confidence, 0) / sessions.length) : 0;
  const avgAccuracy = sessions.filter(s => s.accuracy).length > 0
    ? Math.round(sessions.filter(s => s.accuracy).reduce((sum, s) => sum + (s.accuracy || 0), 0) / sessions.filter(s => s.accuracy).length)
    : 0;
  
  const agentUsage: Record<string, number> = {};
  sessions.forEach(s => {
    s.agents.forEach(a => { agentUsage[a] = (agentUsage[a] || 0) + 1; });
  });
  
  const verdictDistribution = {
    BUY: sessions.filter(s => s.verdict === 'BUY').length,
    HOLD: sessions.filter(s => s.verdict === 'HOLD').length,
    SELL: sessions.filter(s => s.verdict === 'SELL').length,
  };

  return { totalSessions, totalSpent, avgConfidence, avgAccuracy, agentUsage, verdictDistribution, credits: user?.credits || 0, plan: user?.plan || 'free' };
}
