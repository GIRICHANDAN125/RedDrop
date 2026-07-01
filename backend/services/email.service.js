const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const templates = {
  otp: ({ name, otp, purpose }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #fff; margin: 0; }
        .container { max-width: 500px; margin: 40px auto; }
        .card { background: #1a1a2e; border-radius: 20px; padding: 40px; border: 1px solid #e6394620; }
        .logo { color: #e63946; font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 8px; }
        .subtitle { color: #666; text-align: center; font-size: 13px; margin-bottom: 32px; }
        .otp-box { background: #e63946; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
        .otp { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: white; }
        .note { color: #888; font-size: 13px; text-align: center; margin-top: 16px; }
        h2 { color: #fff; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">🩸 Red Drop AI</div>
          <div class="subtitle">Emergency Blood Donor Network</div>
          <h2>Hi ${name}!</h2>
          <p style="color:#aaa;text-align:center">Your OTP for <strong style="color:#e63946">${purpose}</strong></p>
          <div class="otp-box"><div class="otp">${otp}</div></div>
          <p class="note">⏱️ This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  welcome: ({ name }) => `
    <h1>Welcome to Red Drop AI, ${name}!</h1>
    <p>You're now part of a network that saves lives.</p>
  `
};

exports.sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const htmlContent = template && templates[template]
      ? templates[template](data)
      : html || '<p>No content</p>';

    await transporter.sendMail({
      from: `"Red Drop AI 🩸" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent
    });
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw — email failure shouldn't break the API
  }
};
