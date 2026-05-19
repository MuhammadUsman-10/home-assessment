const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { register, verifyEmail, login, refresh, logout } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const registerRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('mobileNumber').trim().notEmpty().withMessage('Mobile number is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain number')
    .matches(/[^A-Za-z0-9]/).withMessage('Must contain special character'),
  body('userType').isIn(['Retailer', 'WholeSaler', 'Distributor']).withMessage('Invalid user type'),
];
const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, validate(registerRules), register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, validate(loginRules), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
