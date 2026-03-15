// backend/middlewares/uploadVideo.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const INPUT_DIR = path.join(__dirname, "..", "uploads", "input");
fs.mkdirSync(INPUT_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, INPUT_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".mp4";
    const safe = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isVideo =
    (file.mimetype && file.mimetype.startsWith("video/")) ||
    /\.(mp4|mov|mkv|webm|avi)$/i.test(file.originalname);

  if (!isVideo) {
    return cb(new Error("Faqat video fayl qabul qilinadi (mp4/mov/mkv/webm/avi)"));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB
    // E'TIBOR: fields limit qo'ymaymiz, aks holda title/topicId req.body ga tushmaydi
  },
});

module.exports = upload;