const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP. Please try again in 15 minutes.' },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: 'Too many upload requests. Please try again later.' },
});

module.exports = { authLimiter, uploadLimiter };
