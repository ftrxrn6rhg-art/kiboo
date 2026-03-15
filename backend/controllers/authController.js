const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { sendEmail } = require("../utils/mailer");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
   { expiresIn: "365d" }
  );
};

async function generateUniqueParentCode() {
  for (let i = 0; i < 5; i += 1) {
    const code = `KIBOO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const exists = await User.findOne({ parentCode: code }).select("_id").lean();
    if (!exists) return code;
  }
  return `KIBOO-${Date.now().toString(36).toUpperCase()}`;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function setEmailVerification(user) {
  const token = crypto.randomBytes(32).toString("hex");
  user.emailVerificationTokenHash = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  user.emailVerified = false;
  await user.save();
  return token;
}

function buildVerifyUrl(token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/verify-email?token=${token}`;
}

function buildResetUrl(token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  return `${base}/reset-password?token=${token}`;
}

async function setPasswordReset(user) {
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 soat
  await user.save();
  return token;
}

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name/email/password majburiy" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Bu email band" });
    }

    const allowedRoles = ["student", "teacher", "parent"];
    const safeRole = allowedRoles.includes(String(role || "").toLowerCase())
      ? String(role).toLowerCase()
      : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: safeRole,
    });

    if (!user.parentCode) {
      user.parentCode = await generateUniqueParentCode();
      await user.save();
    }

    // email verification
    const verifyToken = await setEmailVerification(user);
    const verifyUrl = buildVerifyUrl(verifyToken);

    const mailRes = await sendEmail({
      to: user.email,
      subject: "KIBOO — Emailni tasdiqlash",
      text: `Profilni faollashtirish uchun link: ${verifyUrl}`,
      html: `<p>Profilni faollashtirish uchun link: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    const token = signToken(user);

    res.status(201).json({
      message: "Register success. Emailga tasdiqlash linki yuborildi.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        parentCode: user.parentCode || "",
        emailVerified: user.emailVerified,
      },
      verifyUrl: mailRes?.dev ? verifyUrl : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: "Register error", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email/password majburiy" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email yoki parol xato" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Email yoki parol xato" });
    }

    if (user.emailVerified === false) {
      const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      const allowUnverified = String(process.env.ALLOW_UNVERIFIED_LOGIN || "").toLowerCase() === "true";
      if (!smtpConfigured || allowUnverified) {
        user.emailVerified = true;
        user.emailVerifiedAt = user.emailVerifiedAt || new Date();
        user.emailVerificationTokenHash = "";
        user.emailVerificationExpires = null;
        await user.save();
      } else {
        return res.status(403).json({ message: "Email tasdiqlanmagan", code: "EMAIL_NOT_VERIFIED" });
      }
    }

    if (user.role === "student" && !user.parentCode) {
      user.parentCode = await generateUniqueParentCode();
      await user.save();
    }

    const token = signToken(user);

    res.json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        parentCode: user.parentCode || "",
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = String(req.query.token || "").trim();
    if (!token) return res.status(400).json({ message: "Token yo‘q" });

    const hash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: hash,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Token yaroqsiz yoki eskirgan" });

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.emailVerificationTokenHash = "";
    user.emailVerificationExpires = null;
    await user.save();

    return res.json({ message: "✅ Email tasdiqlandi" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email kerak" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Agar email mavjud bo‘lsa, link yuborildi." });
    }

    if (user.emailVerified) {
      return res.json({ message: "Email allaqachon tasdiqlangan." });
    }

    const token = await setEmailVerification(user);
    const verifyUrl = buildVerifyUrl(token);

    const mailRes = await sendEmail({
      to: user.email,
      subject: "KIBOO — Emailni tasdiqlash",
      text: `Profilni faollashtirish uchun link: ${verifyUrl}`,
      html: `<p>Profilni faollashtirish uchun link: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return res.json({
      message: "Tasdiqlash linki yuborildi.",
      verifyUrl: mailRes?.dev ? verifyUrl : undefined,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email kerak" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Agar email mavjud bo‘lsa, link yuborildi." });
    }

    const token = await setPasswordReset(user);
    const resetUrl = buildResetUrl(token);

    const mailRes = await sendEmail({
      to: user.email,
      subject: "KIBOO — Parolni tiklash",
      text: `Parolni tiklash uchun link: ${resetUrl}`,
      html: `<p>Parolni tiklash uchun link: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return res.json({
      message: "Parolni tiklash linki yuborildi.",
      resetUrl: mailRes?.dev ? resetUrl : undefined,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");

    if (!token) return res.status(400).json({ message: "Token yo‘q" });
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Parol kamida 6 ta bo‘lsin" });
    }

    const hash = hashToken(token);
    const user = await User.findOne({
      resetPasswordTokenHash: hash,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: "Token yaroqsiz yoki eskirgan" });

    user.password = password;
    user.resetPasswordTokenHash = "";
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "✅ Parol yangilandi" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.me = async (req, res) => {
  // protect middleware req.user qo‘yib beradi
  res.json({
    message: "Protected route ishladi ✅",
    user: req.user,
  });
};
