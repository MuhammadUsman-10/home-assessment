const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify().then(() => {
  console.log('✅  Email transporter ready');
}).catch((err) => {
  console.warn('⚠️   Email transporter verification failed:', err.message);
});

module.exports = transporter;
