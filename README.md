# Synapse Judgement - AI Investment Council Platform

A full-featured AI-powered investment analysis platform with 5 specialized agents and a Judge that synthesizes their verdicts.

## 🎯 Features

### Core Platform
- **5 AI Agents**: Technical, Fundamental, Portfolio, News, and Earning Calls analysts
- **The Judge**: Synthesizes agent verdicts into a final decision (BUY/HOLD/SELL)
- **Real-time Analysis**: See agent processing with animated progress indicators
- **Detailed Reports**: Each agent provides confidence scores and key metrics
- **Transparent Pricing**: Pay only for the agents you use ($4-8 per analysis)

### User System
- **Authentication**: Sign up/login with email and password
- **Dashboard**: View analysis history, statistics, and achievements
- **Credits System**: 50 free credits on signup, earn more through referrals
- **Subscription Tiers**: Free, Pro ($29/mo), and Enterprise ($99/mo) plans
- **Achievement System**: Unlock badges for milestones and activity

### Growth Features
- **Leaderboard**: Public ranking of top analysts by accuracy
- **Referral Program**: Earn 25 credits for each friend who joins
- **Live Verdicts Feed**: See recent analyses from the community
- **Social Proof**: Display accuracy scores and session counts

## 🚀 Getting Started

### Demo Access
1. Visit the site
2. Click "Sign in" in the navigation
3. Use demo credentials (pre-filled): `demo@synapse.ai` / `demo123`
4. Explore the dashboard with sample data

### New User Flow
1. Sign up to get 50 free credits
2. Select agents for your analysis (minimum 1)
3. Enter a ticker symbol (e.g., AAPL, TSLA, NVDA)
4. Click "Run Analysis" to see results
5. View detailed breakdown from each agent
6. Get the Judge's final verdict

## 📊 Analysis Process

### Agent Selection
- **Technical** ($5): Chart patterns, indicators, price action
- **Fundamental** ($7): Financial metrics, valuation, growth
- **Portfolio** ($6): Risk assessment, correlation, position sizing
- **News** ($4): Sentiment analysis, recent developments
- **Earning Calls** ($8): Management tone, guidance, Q&A insights

### The Judge
- Automatically activated when 2+ agents are selected
- Weighs agent opinions by confidence scores
- Provides final verdict with reasoning
- Free with 2+ agents, $15 for single-agent analysis

## 🏆 Gamification

### Achievements
- **First Verdict**: Complete your first analysis
- **Power User**: Run 50+ analyses
- **Diversified**: Use all 5 agents
- **Streak Master**: Maintain daily analysis streak
- **Community Leader**: Refer 10+ friends

### Leaderboard
- Ranked by accuracy score
- Shows session count and current streak
- Public profiles with anonymized names
- Updated hourly

## 💎 Subscription Plans

### Free ($0)
- 50 credits on signup
- Access to all 5 agents
- Basic verdict reports
- Community support

### Pro ($29/month)
- 500 credits/month
- Priority processing
- Detailed reasoning
- Email support
- API access

### Enterprise ($99/month)
- 2000 credits/month
- Custom agents
- White-label reports
- Dedicated support
- SLA guarantee
- Team seats

## 🎨 Design Philosophy

### Apple-Inspired UI
- Clean, minimalist design
- Smooth animations and transitions
- Gradient accents (blue to purple)
- Generous whitespace
- Card-based layouts with soft shadows

### User Experience
- Instant price updates when toggling agents
- Progressive disclosure of information
- Clear visual hierarchy
- Responsive design for all devices
- Accessibility-focused

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite
- **Routing**: Custom hash-based router
- **State Management**: React hooks + localStorage
- **Animations**: CSS animations + Framer Motion patterns

## 📁 Project Structure

```
src/
├── components/
│   ├── AgentPage.tsx       # Individual agent detail pages
│   ├── AgentStore.tsx      # Agent selection interface
│   ├── AuthPage.tsx        # Login/signup forms
│   ├── Dashboard.tsx       # User dashboard
│   ├── Faq.tsx            # FAQ section
│   ├── Footer.tsx         # Site footer
│   ├── Hero.tsx           # Landing page hero
│   ├── Icon.tsx           # SVG icon components
│   ├── Leaderboard.tsx    # Public leaderboard
│   ├── Nav.tsx            # Navigation header
│   ├── Pipeline.tsx       # How it works section
│   ├── RequestSection.tsx # Analysis request form
│   ├── ResultsDashboard.tsx # Analysis results display
│   ├── Reveal.tsx         # Scroll animation wrapper
│   ├── StickyBar.tsx      # Floating action bar
│   ├── Transparency.tsx   # Pricing transparency
│   └── viz.tsx            # Data visualization components
├── data/
│   └── agentMock.ts       # Mock data for agent pages
├── lib/
│   ├── auth.ts            # Authentication system
│   ├── engine.ts          # Analysis engine
│   ├── hooks.ts           # Custom React hooks
│   └── router.ts          # Hash-based routing
└── App.tsx                # Main application component
```

## 🔐 Authentication

The platform uses localStorage for demo purposes:
- User data stored in `synapse_user`
- Session history in `synapse_sessions`
- Referrals tracked in `synapse_referrals`

**Note**: This is a demo implementation. For production, integrate with a proper authentication service (Auth0, Firebase Auth, etc.).

## 📈 Analytics & Metrics

The dashboard tracks:
- Total sessions run
- Total credits spent
- Average confidence score
- Average accuracy (when available)
- Agent usage distribution
- Verdict distribution (BUY/HOLD/SELL)

## 🎯 Future Enhancements

- [ ] Real-time market data integration
- [ ] Custom agent creation
- [ ] Portfolio tracking
- [ ] Alert system for verdicts
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Advanced charting tools
- [ ] Social features (comments, discussions)

## 📝 License

This is a demo project for educational purposes.

## 🤝 Contributing

This is a demonstration project. For production use, consider:
- Adding backend API
- Implementing real authentication
- Integrating actual market data
- Adding payment processing
- Implementing rate limiting
- Adding error tracking

---

**Built with React, TypeScript, and Tailwind CSS**
