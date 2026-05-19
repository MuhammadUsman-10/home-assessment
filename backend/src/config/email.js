const nodemailer = require('nodemailer');

// Support both SMTP_APP_PASSWORD and SMTP_PASS (whichever is set in Render)
const smtpPass = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS;

if (!process.env.SMTP_USER || !smtpPass) {
  console.warn('⚠️   Email env vars missing: SMTP_USER or SMTP_APP_PASSWORD/SMTP_PASS not set');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: smtpPass,
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify().then(() => {
  console.log('✅  Email transporter ready');
}).catch((err) => {
  console.warn('⚠️   Email transporter verification failed:', err.message);
  console.warn('    → SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.warn('    → SMTP_PASS:', smtpPass ? '(set)' : 'NOT SET');
});

module.exports = transporter;
