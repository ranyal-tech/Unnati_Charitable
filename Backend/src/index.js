require('dotenv').config();

const { initFileLogging } = require('./utils/logger');
initFileLogging();

const express = require('express');
const cors = require('cors');
const { logCashfreeConfig } = require('./config/cashfree');

const categoriesRouter = require('./routes/categories');
const donationsRouter = require('./routes/donations');
const logsRouter = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // Allow Vercel production and preview deployment URLs
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
    return true;
  }

  // Allow the production domain and its www subdomain
  if (/^https:\/\/(www\.)?unnatiseva\.com$/i.test(normalizedOrigin)) {
    return true;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      console.warn('CORS blocked origin:', origin);
      callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'Unnati Charitable Trust API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Unnati Charitable Trust API is running' });
});

app.use('/api/categories', categoriesRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/logs', logsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logCashfreeConfig();
  require('./services/emailService').logEmailConfig();
});
