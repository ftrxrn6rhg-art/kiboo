// backend/routes/teacherRoutes.js
const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");

const getMyVideos = require("../controllers/teachers/getMyVideos.controller");
const videoStats = require("../controllers/teachers/videoStats.controller");
const getMyProfile = require("../controllers/teachers/getMyProfile.controller");
const updateMyProfile = require("../controllers/teachers/updateMyProfile.controller");
const uploadAvatar = require("../middlewares/uploadAvatar");
const uploadMyAvatar = require("../controllers/teachers/uploadMyAvatar.controller");
const uploadCertificate = require("../middlewares/uploadCertificate");
const uploadMyCertificate = require("../controllers/teachers/uploadMyCertificate.controller");

// Teacher-only
router.use(protect, roleCheck("teacher"));

// ✅ Teacher profile
// GET /api/teachers/me
router.get("/me", getMyProfile);

// ✅ Teacher profile update
// PUT /api/teachers/me
router.put("/me", updateMyProfile);

// ✅ Teacher avatar upload
// POST /api/teachers/me/avatar (form-data: avatar)
router.post("/me/avatar", uploadAvatar.single("avatar"), uploadMyAvatar);

// ✅ Teacher certificate upload
// POST /api/teachers/me/certificates (form-data: certificate)
router.post("/me/certificates", uploadCertificate.single("certificate"), uploadMyCertificate);

// ✅ Teacher: faqat o'z videolari
// GET /api/teachers/videos?subjectId=&topicId=&grade=&status=&q=&page=&limit=
router.get("/videos", getMyVideos);

// ✅ Teacher: video stats
// GET /api/teachers/videos/stats
router.get("/videos/stats", videoStats);

module.exports = router;
