// backend/routes/quizRoutes.js
const router = require("express").Router();
const { protect, roleCheck } = require("../middlewares/authMiddleware");

const { submitQuiz, myQuizAttempts } = require("../controllers/progress/quiz.controller");

router.get("/me", protect, roleCheck("student"), myQuizAttempts);
router.post("/videos/:videoId/submit", protect, roleCheck("student"), submitQuiz);

module.exports = router;