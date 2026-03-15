// backend/utils/mailer.js
const nodemailer = require("nodemailer");

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  FROM_EMAIL,
} = process.env;

let transporter = null;

if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log("⚠️ SMTP not configured. Email content:", { to, subject, text });
    return { dev: true };
  }

  const from = FROM_EMAIL || SMTP_USER || "no-reply@kiboo.local";
  return transporter.sendMail({ from, to, subject, html, text });
}

module.exports = { sendEmail };
