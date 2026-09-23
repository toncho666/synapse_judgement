import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@synapse.ai' },
    update: {},
    create: {
      email: 'demo@synapse.ai',
      name: 'Demo User',
      passwordHash,
      avatar: '🎯',
      plan: 'PRO',
      credits: 847,
      referralCode: 'DEMO2026',
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Create sample sessions
  const sessions = [
    {
      ticker: 'AAPL',
      agents: ['tech', 'fund', 'news'],
      status: 'COMPLETED',
      verdict: 'BUY',
      verdictWord: 'Buy',
      confidence: 87,
      targetPrice: 245.50,
      basePrice: 238.20,
      composite: 0.72,
      consensusBull: 2,
      consensusFlat: 1,
      consensusBear: 0,
      rationale: [
        '2 of 3 agents on the same side — consensus weight 67%.',
        'The strongest bullish argument comes from Technical (confidence 74%).',
        'Composite signal 72.0 pts out of 100 — the bullish edge is durable.',
      ],
      cost: 16,
      completedAt: new Date('2026-01-20T14:30:00Z'),
    },
    {
      ticker: 'TSLA',
      agents: ['tech', 'earn'],
      status: 'COMPLETED',
      verdict: 'HOLD',
      verdictWord: 'Hold',
      confidence: 72,
      targetPrice: 268.00,
      basePrice: 252.40,
      composite: 0.15,
      consensusBull: 1,
      consensusFlat: 1,
      consensusBear: 0,
      rationale: [
        '1 of 2 agents on the same side — consensus weight 50%.',
        'The strongest bullish argument comes from Technical (confidence 68%).',
        'Composite signal 15.0 pts out of 100 — the arguments are balanced.',
      ],
      cost: 13,
      completedAt: new Date('2026-01-19T09:15:00Z'),
    },
    {
      ticker: 'NVDA',
      agents: ['tech', 'fund', 'port', 'news', 'earn'],
      status: 'COMPLETED',
      verdict: 'BUY',
      verdictWord: 'Buy',
      confidence: 91,
      targetPrice: 1180.00,
      basePrice: 1042.10,
      composite: 0.85,
      consensusBull: 4,
      consensusFlat: 1,
      consensusBear: 0,
      rationale: [
        '4 of 5 agents on the same side — consensus weight 80%.',
        'The strongest bullish argument comes from Fundamental (confidence 81%).',
        'Composite signal 85.0 pts out of 100 — the bullish edge is durable.',
      ],
      cost: 30,
      completedAt: new Date('2026-01-18T16:45:00Z'),
    },
  ];

  for (const sessionData of sessions) {
    const session = await prisma.session.create({
      data: {
        userId: demoUser.id,
        ...sessionData,
        agentVerdicts: {
          create: sessionData.agents.map((agentId) => ({
            agentId,
            signal: 'BULL',
            score: 0.65,
            confidence: Math.floor(Math.random() * 30) + 60,
            lines: [
              'Sample analysis line 1',
              'Sample analysis line 2',
              'Sample analysis line 3',
            ],
            metrics: [
              { label: 'Metric 1', value: 'Value 1' },
              { label: 'Metric 2', value: 'Value 2' },
            ],
          })),
        },
      },
    });

    console.log(`✅ Created session: ${session.ticker} (${session.verdict})`);
  }

  // Create transactions
  await prisma.transaction.create({
    data: {
      userId: demoUser.id,
      type: 'WELCOME_BONUS',
      amount: 50,
      description: 'Welcome bonus on signup',
    },
  });

  console.log('✅ Created welcome transaction');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
