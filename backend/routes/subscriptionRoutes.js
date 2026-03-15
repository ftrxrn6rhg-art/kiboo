const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const {
  getMySubscription,
  subscribeStudent,
  activateSubscription,
  deactivateSubscription,
} = require("../controllers/subscriptionController");

// student: o'z subscription holatini ko'radi
router.get("/me", protect, roleCheck("student"), getMySubscription);

// ✅ student: o'zi obuna sotib oladi
// POST /api/subscriptions/subscribe  body: { subjectId, months: 1|3|12 }

// ✅ alias: eski frontend uchun (buy -> subscribe)
router.post("/buy", protect, roleCheck("student"), subscribeStudent);

router.post("/subscribe", protect, roleCheck("student"), subscribeStudent);

// admin: student subscriptionni active qiladi
router.post("/activate/:studentId", protect, roleCheck("admin"), activateSubscription);

// admin: student subscriptionni expired qiladi
router.post("/deactivate/:studentId", protect, roleCheck("admin"), deactivateSubscription);

module.exports = router;
