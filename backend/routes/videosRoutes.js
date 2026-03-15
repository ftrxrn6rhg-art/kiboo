// backend/routes/videosRoutes.js
const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const { requireActiveSubscription } = require("../middlewares/subscriptionMiddleware");
const upload = require("../middlewares/uploadVideo");
const requireTeacherApproval = require("../middlewares/requireTeacherApproval");

const uploadVideo = require("../controllers/videos/uploadVideo.controller");
const getVideos = require("../controllers/videos/getVideos.controller");
const getVideoById = require("../controllers/videos/getVideoById.controller");
const updateVideo = require("../controllers/videos/updateVideo.controller");
const deleteVideo = require("../controllers/videos/deleteVideo.controller");
const { toggleLike, toggleDislike } = require("../controllers/videos/likeVideo.controller");

// playlist controller
const streamCtrl = require("../controllers/videos/streamVideo.controller");
// segment controller
const segmentCtrl = require("../controllers/videos/segmentVideo.controller");

// stream funksiyasini topib olish (har xil export variantlariga mos)
const streamVideo =
  streamCtrl.streamVideo ||
  streamCtrl.stream ||
  streamCtrl.videoStream ||
  streamCtrl;

const streamSegment =
  segmentCtrl.streamSegment ||
  segmentCtrl.segment ||
  segmentCtrl.stream ||
  segmentCtrl;

// ✅ query-token mode uchun: ?token=JWT -> Authorization: Bearer JWT
function injectAuthFromQuery(req, _res, next) {
  try {
    if (!req.headers.authorization && req.query && req.query.token) {
      req.headers.authorization = `Bearer ${String(req.query.token)}`;
    }
  } catch {}
  next();
}

function requireSubscriptionIfStudent(req, res, next) {
  const role = req.user?.role;
  if (role === "student") {
    return requireActiveSubscription(req, res, next);
  }
  return next();
}

// ✅ faqat teacher (yoki admin) upload qila oladi
router.post(
  "/upload",
  protect,
  roleCheck("teacher", "admin"),
  requireTeacherApproval,
  upload.single("video"),
  uploadVideo
);

// ✅ student/teacher videolarni ko‘ra oladi
router.get("/", protect, requireSubscriptionIfStudent, getVideos);

// ✅ video detail
router.get("/:id", protect, getVideoById);

// ✅ video update (title)
router.patch("/:id", protect, roleCheck("teacher", "admin"), updateVideo);

// ✅ delete video (owner teacher yoki admin)
router.delete("/:id", protect, roleCheck("teacher", "admin"), deleteVideo);

// ✅ like / dislike
router.post("/:id/like", protect, toggleLike);
router.post("/:id/dislike", protect, toggleDislike);

// ✅ PROTECTED HLS: playlist
// GET /api/videos/:id/stream
// - Header mode: Authorization header bilan ishlaydi (Hls.js)
// - Query-token mode: /stream?token=JWT bilan ham ishlaydi (native HLS fallback)
router.get("/:id/stream", injectAuthFromQuery, protect, requireSubscriptionIfStudent, streamVideo);

// ✅ HLS segmentlar (hozircha ochiq qoldiramiz — native HLS uchun eng oson fallback)
// GET /api/videos/:id/segments/index0.ts
router.get("/:id/segments/:segment", (req, res, next) => {
  if (typeof streamSegment === "function") return streamSegment(req, res, next);
  return res.status(500).json({ message: "streamSegment controller topilmadi" });
});

module.exports = router;
