const jwt = require('jsonwebtoken');

const tokenService = {
  /**
   * Generate short-lived access token (15 minutes)
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  },

  /**
   * Generate long-lived refresh token (7 days)
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
  },

  /**
   * Generate signed email verification token (24 hours)
   */
  generateEmailToken(payload) {
    return jwt.sign(payload, process.env.JWT_EMAIL_SECRET, {
      expiresIn: process.env.JWT_EMAIL_EXPIRES_IN || '24h',
    });
  },

  /**
   * Verify access token — throws on failure
   */
  verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  },

  /**
   * Verify refresh token — throws on failure
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  },

  /**
   * Verify email token — throws on failure
   */
  verifyEmailToken(token) {
    return jwt.verify(token, process.env.JWT_EMAIL_SECRET);
  },
};

module.exports = tokenService;
