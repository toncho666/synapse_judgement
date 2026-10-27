import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import userRoutes from './routes/user.routes.js';
import stocksRoutes from './routes/stocks.routes.js';
import technicalAnalysisRoutes from './routes/technical-analysis.routes.js';
import newsAnalysisRoutes from './routes/news-analysis.routes.js';
import earningsCallRoutes from './routes/earnings-call.routes.js';
import { startBackgroundUpdates } from './services/stock.service.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API keys status check
app.get('/api/status/keys', (req, res) => {
  const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const twelveDataKey = process.env.TWELVEDATA_API_KEY;
  
  const alphaVantageConfigured = !!(
    alphaVantageKey && 
    alphaVantageKey !== 'demo' && 
    alphaVantageKey !== 'your_alpha_vantage_api_key_here' &&
    alphaVantageKey.length > 10
  );
  
  const finnhubConfigured = !!(
    finnhubKey && 
    finnhubKey !== '' && 
    finnhubKey !== 'your_finnhub_api_key_here' &&
    finnhubKey.length > 10
  );
  
  const twelveDataConfigured = !!(
    twelveDataKey &&
    twelveDataKey !== '' &&
    twelveDataKey !== 'your_twelvedata_api_key_here' &&
    twelveDataKey.length > 10
  );

  res.json({
    success: true,
    data: {
      twelveData: {
        configured: twelveDataConfigured,
        keyPreview: twelveDataConfigured
          ? `${twelveDataKey!.substring(0, 4)}...${twelveDataKey!.substring(twelveDataKey!.length - 4)}`
          : null,
        status: twelveDataConfigured
          ? '✅ Ready (historical data + quotes)'
          : '❌ Not configured - technical analysis and stock quotes will not work'
      },
      alphaVantage: {
        configured: alphaVantageConfigured,
        keyPreview: alphaVantageConfigured 
          ? `${alphaVantageKey!.substring(0, 4)}...${alphaVantageKey!.substring(alphaVantageKey!.length - 4)}`
          : null,
        status: alphaVantageConfigured ? '✅ Ready' : '❌ Not configured'
      },
      finnhub: {
        configured: finnhubConfigured,
        keyPreview: finnhubConfigured 
          ? `${finnhubKey!.substring(0, 4)}...${finnhubKey!.substring(finnhubKey!.length - 4)}`
          : null,
        status: finnhubConfigured ? '✅ Ready' : '❌ Not configured'
      }
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/technical-analysis', technicalAnalysisRoutes);
app.use('/api/news-analysis', newsAnalysisRoutes);
app.use('/api/earnings-call', earningsCallRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend URL: ${config.frontendUrl}`);
  logger.info(`📊 API available at http://localhost:${config.port}/api`);
  
  // Check API keys
  const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const twelveDataKey = process.env.TWELVEDATA_API_KEY;

  if (twelveDataKey && twelveDataKey !== 'your_twelvedata_api_key_here') {
    logger.info(`✅ Twelve Data API key configured: ${twelveDataKey.substring(0, 4)}...${twelveDataKey.substring(twelveDataKey.length - 4)} (historical data + stock quotes)`);
  } else {
    logger.warn(`⚠️  Twelve Data API key NOT configured - technical analysis and stock quotes will NOT work. Get a free key at https://twelvedata.com/pricing`);
  }
  
  if (alphaVantageKey && alphaVantageKey !== 'demo' && alphaVantageKey !== 'your_alpha_vantage_api_key_here') {
    logger.info(`✅ Alpha Vantage API key configured: ${alphaVantageKey.substring(0, 4)}...${alphaVantageKey.substring(alphaVantageKey.length - 4)}`);
  } else {
    logger.warn(`⚠️  Alpha Vantage API key NOT configured - news agent will return neutral analysis`);
  }
  
  if (finnhubKey && finnhubKey !== '' && finnhubKey !== 'your_finnhub_api_key_here') {
    logger.info(`✅ Finnhub API key configured: ${finnhubKey.substring(0, 4)}...${finnhubKey.substring(finnhubKey.length - 4)}`);
  } else {
    logger.warn(`⚠️  Finnhub API key NOT configured - earnings transcripts will not work`);
  }
  
  // Start background stock updates
  startBackgroundUpdates();
});

export default app;
