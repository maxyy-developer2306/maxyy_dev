
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

// Allowed frontend domains
const allowedOrigins = new Set([
  ...String(process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim()),

  'https://max-compny-buissnes.vercel.app',
  'https://ajeer-qiwa-hrc-verified.vercel.app'
].filter(Boolean));

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Database connection cache for Vercel
let databasePromise = null;

function ensureDatabase() {
  if (!databasePromise) {
    databasePromise = connectDatabase().catch(error => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

// Database status
const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

async function statusHandler(req, res) {
  try {
    await ensureDatabase();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }

  const state =
    DB_STATES[mongoose.connection.readyState] || 'unknown';

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

// Status routes
app.get('/', statusHandler);
app.get('/api', statusHandler);

// Ensure database connection before other routes
app.use(async (req, res, next) => {
  try {
    await ensureDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

// API routes
app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20
  }),
  require('./routes/auth')
);

app.use('/api/permits', require('./routes/permits'));

app.use(
  '/api/public',
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60
  }),
  require('./routes/public')
);

app.use('/', require('./routes/public'));

// Error handler
app.use((error, req, res, next) => {
  console.error(error);

  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed by CORS'
    });
  }

  res.status(error.status || 500).json({
    error: 'Internal server error'
  });
});

// Local server / Vercel export
if (require.main === module) {
  ensureDatabase()
    .then(() => {
      const port = Number(process.env.PORT || 5000);

      app.listen(port, () => {
        console.log(
          `MAXYY DEV backend running on port ${port}`
        );
      });
    })
    .catch(error => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}

module.exports = app;
