// backend/routes/lessonRoutes.js
const express = require("express");
const router = express.Router();

const {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const { requireActiveSubscription } = require("../middlewares/subscriptionMiddleware");

// READ (subscription kerak)
router.get("/", protect, requireActiveSubscription, getLessons);
router.get("/:id", protect, requireActiveSubscription, getLessonById);

// WRITE (admin yoki teacher)
router.post("/", protect, roleCheck("admin", "teacher"), createLesson);
router.put("/:id", protect, roleCheck("admin", "teacher"), updateLesson);
router.delete("/:id", protect, roleCheck("admin", "teacher"), deleteLesson);

module.exports = router;