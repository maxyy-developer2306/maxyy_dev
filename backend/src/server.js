require('dotenv').config();
const express = require('express');
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

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }), require('./routes/auth'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/public', rateLimit({ windowMs: 60 * 1000, limit: 60 }), require('./routes/public'));
app.use('/', require('./routes/public'));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: 'Internal server error' });
});

async function start() {
  await connectDatabase();
  const port = Number(process.env.PORT || 5000);
  app.listen(port, () => console.log(`MAXYY DEV backend running on port ${port}`));
}

start().catch(error => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
