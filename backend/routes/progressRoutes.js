// backend/routes/progressRoutes.js
const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");

// Video progress (texnik progress)
const videoCtrl = require("../controllers/progress/videoProgress.controller");

// Student progress (sakramaslik qoidasi uchun progress)
const spCtrl = require("../controllers/progress/studentProgress.controller");

/**
 * STUDENT PROGRESS (subscription asosida)
 */
// Progressni mavjud bo‘lmasa yaratib beradi
// POST /api/progress/ensure
router.post("/ensure", protect, roleCheck("student"), spCtrl.ensureMyProgress);

// Hozirgi subscription + progress holatini beradi
// GET /api/progress/plan
router.get("/plan", protect, roleCheck("student"), spCtrl.getMyPlan);
// Hozirgi ochiq topic + videolar
// GET /api/progress/current
router.get("/current", protect, roleCheck("student"), spCtrl.getMyCurrentContent);
/**
 * VIDEO PROGRESS (video pozitsiya/complete)
 */
router.get("/videos/:videoId", protect, roleCheck("student"), videoCtrl.getOne);
router.patch("/videos/:videoId/position", protect, roleCheck("student"), videoCtrl.upsertPosition);
router.post("/videos/:videoId/completed", protect, roleCheck("student"), videoCtrl.markCompleted);
router.get("/me", protect, roleCheck("student"), videoCtrl.myProgress);

module.exports = router;
