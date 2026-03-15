// backend/routes/curriculumRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
  getGradesBySubject,
  getStructure,
} = require("../controllers/curriculum/curriculum.controller");

// hamma role ko‘rsin (student/teacher/parent)
router.get("/subjects/:subjectId/grades", protect, getGradesBySubject);
router.get("/structure", protect, getStructure);

module.exports = router;