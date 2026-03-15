const express = require("express");
const router = express.Router();

const { protect, roleCheck } = require("../middlewares/authMiddleware");
const requireTeacherApproval = require("../middlewares/requireTeacherApproval");

const {
  teacherCreateAssignment,
  teacherAddQuestion,
  teacherPublishAssignment,
  teacherGetMyAssignments,
  teacherDeleteAssignment,
  teacherUploadAssignmentFile,
} = require("../controllers/assignments/teacherAssignments.controller");
const uploadAssignmentFile = require("../middlewares/uploadAssignmentFile");

const {
  studentGetAssignments,
  studentGetAssignmentsByTopic,
  studentStartAttempt,
  studentSubmitAttempt,
  studentGetMyAttempts,
} = require("../controllers/assignments/studentAssignments.controller");
const { toggleLike, toggleDislike } = require("../controllers/assignments/likeAssignment.controller");

// ======================
// TEACHER
// ======================
router.post("/teacher", protect, roleCheck("teacher"), requireTeacherApproval, teacherCreateAssignment);

router.post(
  "/teacher/:assignmentId/questions",
  protect,
  roleCheck("teacher"),
  requireTeacherApproval,
  teacherAddQuestion
);

// ✅ publish
router.patch(
  "/teacher/:assignmentId/publish",
  protect,
  roleCheck("teacher"),
  requireTeacherApproval,
  teacherPublishAssignment
);

router.get("/teacher", protect, roleCheck("teacher"), teacherGetMyAssignments);
router.delete("/teacher/:assignmentId", protect, roleCheck("teacher"), teacherDeleteAssignment);
router.post(
  "/teacher/:assignmentId/file",
  protect,
  roleCheck("teacher"),
  requireTeacherApproval,
  uploadAssignmentFile.single("file"),
  teacherUploadAssignmentFile
);

// ======================
// STUDENT
// ======================
router.get("/student/topic/:topicId", protect, roleCheck("student"), studentGetAssignmentsByTopic);
router.get("/student", protect, roleCheck("student"), studentGetAssignments);
router.get("/student/current", protect, roleCheck("student"), studentGetAssignments);

router.post(
  "/student/:assignmentId/start",
  protect,
  roleCheck("student"),
  studentStartAttempt
);

router.post(
  "/student/attempts/:attemptId/submit",
  protect,
  roleCheck("student"),
  studentSubmitAttempt
);

router.get("/student/attempts", protect, roleCheck("student"), studentGetMyAttempts);

// Like / Dislike (student)
router.post("/:id/like", protect, roleCheck("student"), toggleLike);
router.post("/:id/dislike", protect, roleCheck("student"), toggleDislike);

module.exports = router;
