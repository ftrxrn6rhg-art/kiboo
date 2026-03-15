// backend/middlewares/uploadAssignmentFile.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const ASSIGN_DIR = path.join(process.cwd(), "uploads", "assignments");
fs.mkdirSync(ASSIGN_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, ASSIGN_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".pdf";
    cb(null, `${req.user._id}-assignment-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ].includes(file.mimetype);
  if (!ok) return cb(new Error("Faqat PDF/DOC/DOCX/JPG/PNG/WEBP fayl mumkin"), false);
  cb(null, true);
}

const uploadAssignmentFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

module.exports = uploadAssignmentFile;
