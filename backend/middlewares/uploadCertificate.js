// backend/middlewares/uploadCertificate.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const CERT_DIR = path.join(process.cwd(), "uploads", "certificates");
fs.mkdirSync(CERT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, CERT_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    cb(null, `${req.user._id}-cert-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  if (!ok) return cb(new Error("Faqat PDF/JPG/PNG/WEBP fayl mumkin"), false);
  cb(null, true);
}

const uploadCertificate = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = uploadCertificate;
