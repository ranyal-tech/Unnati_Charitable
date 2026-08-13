require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { logCashfreeConfig } = require('./config/cashfree');

const categoriesRouter = require('./routes/categories');
const donationsRouter = require('./routes/donations');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
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

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed by CORS' });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logCashfreeConfig();
});
