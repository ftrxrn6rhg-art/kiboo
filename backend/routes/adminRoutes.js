// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const {
  listTeachers,
  approveTeacher,
  rejectTeacher,
} = require("../controllers/teachers/teacherApproval.controller");

// Admin-only
router.use(protect, roleCheck("admin"));

// Teachers approval
router.get("/teachers", listTeachers);
router.patch("/teachers/:id/approve", approveTeacher);
router.patch("/teachers/:id/reject", rejectTeacher);

module.exports = router;
