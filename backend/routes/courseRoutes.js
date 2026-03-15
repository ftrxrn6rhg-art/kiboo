const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const { protect, roleCheck } = require("../middlewares/authMiddleware");

// READ — hamma logged-in user
router.get("/", protect, getCourses);
router.get("/:id", protect, getCourseById);

// WRITE — admin yoki teacher
router.post("/", protect, roleCheck("admin", "teacher"), createCourse);
router.put("/:id", protect, roleCheck("admin", "teacher"), updateCourse);
router.delete("/:id", protect, roleCheck("admin", "teacher"), deleteCourse);

module.exports = router;