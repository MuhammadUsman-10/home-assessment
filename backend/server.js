require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./src/config/db');
const { errorHandler } = require('./src/middleware/errorHandler');
const authRoutes   = require('./src/routes/auth.routes');
const sellerRoutes = require('./src/routes/seller.routes');
const adminRoutes  = require('./src/routes/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth',    authRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin',   adminRoutes);
app.get('/api/health',  (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
});

module.exports = app;
