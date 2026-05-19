const transporter = require('../config/email');

const FROM = `"ABCElectronics.market" <${process.env.SMTP_USER}>`;

const emailService = {
  async sendVerificationEmail(to, fullName, verificationUrl) {
    await transporter.sendMail({
      from: FROM, to,
      subject: 'Verify your email — ABCElectronics.market',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="600" style="background:#12182B;border-radius:16px;border:1px solid #1E2A45;">
        <tr><td style="background:linear-gradient(135deg,#1A2744,#0D1B3E);padding:32px 40px;text-align:center;">
        <h1 style="color:#3D7EFF;margin:0;font-size:28px;">⚡ ABCElectronics.market</h1></td></tr>
        <tr><td style="padding:40px;">
        <h2 style="color:#E2E8F0;margin:0 0 16px;">Hello, ${fullName}! 👋</h2>
        <p style="color:#94A3B8;line-height:1.7;margin:0 0 24px;">Please verify your email. This link is valid for <strong style="color:#3D7EFF;">24 hours</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
        <a href="${verificationUrl}" style="display:inline-block;background:linear-gradient(135deg,#3D7EFF,#2563EB);color:#fff;text-decoration:none;padding:16px 40px;border-radius:10px;font-weight:600;font-size:16px;">✅ Verify My Email</a></div>
        </td></tr><tr><td style="background:#0D1421;padding:20px 40px;text-align:center;border-top:1px solid #1E2A45;">
        <p style="color:#4A5568;font-size:12px;margin:0;">© 2024 ABCElectronics.market</p></td></tr>
        </table></td></tr></table></body></html>`,
    });
  },

  async sendApprovalEmail(to, fullName, dashboardUrl) {
    await transporter.sendMail({
      from: FROM, to,
      subject: '🎉 Your seller account has been approved!',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="600" style="background:#12182B;border-radius:16px;border:1px solid #1E2A45;">
        <tr><td style="background:linear-gradient(135deg,#1A2744,#0D1B3E);padding:32px 40px;text-align:center;">
        <h1 style="color:#3D7EFF;margin:0;font-size:28px;">⚡ ABCElectronics.market</h1></td></tr>
        <tr><td style="padding:40px;text-align:center;">
        <div style="font-size:48px;margin-bottom:16px;">🎉</div>
        <h2 style="color:#E2E8F0;margin:0 0 16px;">Congratulations, ${fullName}!</h2>
        <p style="color:#94A3B8;line-height:1.7;margin:0 0 24px;">Your seller account has been <strong style="color:#10B981;">approved</strong>. Your store is now live!</p>
        <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#10B981,#059669);color:#fff;text-decoration:none;padding:16px 40px;border-radius:10px;font-weight:600;">Go to My Dashboard →</a>
        </td></tr><tr><td style="background:#0D1421;padding:20px;text-align:center;border-top:1px solid #1E2A45;">
        <p style="color:#4A5568;font-size:12px;margin:0;">© 2024 ABCElectronics.market</p></td></tr>
        </table></td></tr></table></body></html>`,
    });
  },

  async sendRejectionEmail(to, fullName, reason, supportUrl) {
    await transporter.sendMail({
      from: FROM, to,
      subject: 'Update on your seller application — ABCElectronics.market',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="600" style="background:#12182B;border-radius:16px;border:1px solid #1E2A45;">
        <tr><td style="background:linear-gradient(135deg,#1A2744,#0D1B3E);padding:32px 40px;text-align:center;">
        <h1 style="color:#3D7EFF;margin:0;font-size:28px;">⚡ ABCElectronics.market</h1></td></tr>
        <tr><td style="padding:40px;">
        <h2 style="color:#E2E8F0;margin:0 0 16px;">Dear ${fullName},</h2>
        <p style="color:#94A3B8;line-height:1.7;">We are unable to approve your seller account at this time.</p>
        ${reason ? `<div style="background:#1E0A0A;border:1px solid #7F1D1D;border-radius:8px;padding:16px;margin:16px 0;"><p style="color:#FCA5A5;margin:0;font-size:14px;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
        <div style="text-align:center;margin:24px 0;"><a href="${supportUrl}" style="display:inline-block;background:#1E2A45;color:#94A3B8;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;">Contact Support</a></div>
        </td></tr><tr><td style="background:#0D1421;padding:20px;text-align:center;border-top:1px solid #1E2A45;">
        <p style="color:#4A5568;font-size:12px;margin:0;">© 2024 ABCElectronics.market</p></td></tr>
        </table></td></tr></table></body></html>`,
    });
  },

  async sendAdminNotification(toAdmin, subject, message, ctaUrl) {
    await transporter.sendMail({
      from: FROM, to: toAdmin, subject,
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0A0F1E;font-family:Inter,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;">
        <table width="600" style="background:#12182B;border-radius:16px;border:1px solid #1E2A45;">
        <tr><td style="background:linear-gradient(135deg,#1A2744,#0D1B3E);padding:24px 40px;">
        <h1 style="color:#3D7EFF;margin:0;font-size:22px;">⚡ ABCElectronics Admin</h1></td></tr>
        <tr><td style="padding:32px 40px;">
        <p style="color:#E2E8F0;line-height:1.7;margin:0 0 24px;">${message}</p>
        ${ctaUrl ? `<a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#FF9D3D,#EA6F00);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;">Review in Admin Panel →</a>` : ''}
        </td></tr><tr><td style="background:#0D1421;padding:16px;text-align:center;border-top:1px solid #1E2A45;">
        <p style="color:#4A5568;font-size:12px;margin:0;">ABCElectronics Admin System</p></td></tr>
        </table></td></tr></table></body></html>`,
    });
  },
};

module.exports = emailService;
