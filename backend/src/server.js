require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDatabase = require('./config/db');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Cache the connection promise so serverless (Vercel) reuses it between requests
let databasePromise = null;
function ensureDatabase() {
  if (!databasePromise) {
    databasePromise = connectDatabase().catch(error => {
      databasePromise = null; // allow retry on next request
      throw error;
    });
  }
  return databasePromise;
}

// Map mongoose readyState numbers to readable text
const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

// Status handler used by both "/" and "/api"
async function statusHandler(req, res) {
  try {
    await ensureDatabase();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  const state = DB_STATES[mongoose.connection.readyState] || 'unknown';
  const isConnected = state === 'connected';

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: isConnected
      ? 'API is running and database connected successfully'
      : 'API is running but database is not connected',
    service: 'MAXYY DEV backend',
    database: state,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
}

// Status routes (must be before the public router mounted on "/")
app.get('/', statusHandler);
app.get('/api', statusHandler);

// Make sure the database is ready before any other route runs
app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), require('./routes/auth'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/public', rateLimit({ windowMs: 60 * 1000, limit: 60 }), require('./routes/public'));
app.use('/', require('./routes/public'));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: 'Internal server error' });
});

// Local / normal server: start listening. On Vercel the app is exported instead.
if (require.main === module) {
  ensureDatabase()
    .then(() => {
      const port = Number(process.env.PORT || 5000);
      app.listen(port, () => console.log(`MAXYY DEV backend running on port ${port}`));
    })
    .catch(error => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;