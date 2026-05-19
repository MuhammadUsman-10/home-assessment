const axios = require('axios');
const User = require('../models/User');
const AdminNotification = require('../models/AdminNotification');
const tokenService = require('../services/token.service');
const emailService = require('../services/email.service');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function verifyRecaptcha(token) {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Bypass when using placeholder key (dev mode)
  if (!secret || secret === 'your_recaptcha_v3_secret_key') return true;
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
  );
  // data.score only exists for v3; v2 only has data.success
  if (!data.success) return false;
  if (data.score !== undefined) return data.score >= 0.5; // v3 threshold
  return true; // v2 — success is sufficient
}

function issueTokens(user) {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken:  tokenService.generateAccessToken(payload),
    refreshToken: tokenService.generateRefreshToken(payload),
  };
}

const register = async (req, res) => {
  const { fullName, businessName, email, mobileNumber, password, userType, recaptchaToken } = req.body;

  const captchaOk = await verifyRecaptcha(recaptchaToken);
  if (!captchaOk) {
    return res.status(400).json({ message: 'reCAPTCHA verification failed. Please try again.' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: 'Email already registered' });

  const passwordHash = await User.hashPassword(password);
  const emailToken = tokenService.generateEmailToken({ email });

  const user = await User.create({
    fullName, businessName, email, mobileNumber, passwordHash, userType,
    emailVerifyToken: emailToken, status: 'pending_email',
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailToken}`;
  await emailService.sendVerificationEmail(email, fullName, verifyUrl);

  await AdminNotification.create({
    type: 'new_registration', sellerId: user._id, sellerName: fullName,
    message: `New seller registration: ${fullName} (${email}) — awaiting email verification.`,
  });

  // Issue a short-lived upload token so the wizard can POST documents
  // immediately without requiring email verification first.
  const uploadToken = tokenService.generateAccessToken({ id: user._id, role: user.role });

  res.status(201).json({
    message: 'Registration successful. Please check your email to verify your account.',
    userId: user._id,
    uploadToken,
  });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  let decoded;
  try { decoded = tokenService.verifyEmailToken(token); }
  catch (err) {
    // If expired but the user is already verified, treat it as success
    if (err.name === 'TokenExpiredError') {
      // Decode without verifying expiry to get the email
      const rawDecoded = require('jsonwebtoken').decode(token);
      if (rawDecoded?.email) {
        const alreadyVerified = await User.findOne({ email: rawDecoded.email, isEmailVerified: true });
        if (alreadyVerified) {
          return res.json({ message: 'Email already verified. Your application is under review.' });
        }
      }
    }
    return res.status(400).json({ message: 'Invalid or expired verification link.' });
  }

  // Check if already verified (link clicked twice)
  const existingUser = await User.findOne({ email: decoded.email });
  if (!existingUser) return res.status(400).json({ message: 'Account not found.' });

  if (existingUser.isEmailVerified) {
    return res.json({ message: 'Email already verified. Your application is under review.' });
  }

  // Validate token matches what is stored
  if (existingUser.emailVerifyToken !== token) {
    return res.status(400).json({ message: 'Verification link is invalid.' });
  }

  existingUser.isEmailVerified = true;
  existingUser.emailVerifyToken = null;
  existingUser.status = 'pending_approval';
  await existingUser.save();
  res.json({ message: 'Email verified successfully. Your application is under review.' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (!user.isEmailVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in.', code: 'EMAIL_UNVERIFIED' });
  }
  const { accessToken, refreshToken } = issueTokens(user);
  user.refreshTokens.push(refreshToken);
  user.lastActiveAt = new Date();
  await user.save();
  res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
  res.json({ accessToken, user: user.toSafeObject() });
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  let decoded;
  try { decoded = tokenService.verifyRefreshToken(token); }
  catch { return res.status(401).json({ message: 'Invalid or expired refresh token' }); }

  const user = await User.findById(decoded.id);
  if (!user || !user.refreshTokens.includes(token)) {
    return res.status(401).json({ message: 'Refresh token revoked' });
  }
  user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
  const { accessToken, refreshToken: newRefresh } = issueTokens(user);
  user.refreshTokens.push(newRefresh);
  user.lastActiveAt = new Date();
  await user.save();
  res.cookie('refreshToken', newRefresh, COOKIE_OPTS);
  res.json({ accessToken });
};

const logout = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshTokens: token });
    if (user) { user.refreshTokens = user.refreshTokens.filter((t) => t !== token); await user.save(); }
  }
  res.clearCookie('refreshToken', COOKIE_OPTS);
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, verifyEmail, login, refresh, logout };
