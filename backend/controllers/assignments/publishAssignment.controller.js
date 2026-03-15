// backend/controllers/assignments/publishAssignment.controller.js
const mongoose = require("mongoose");
const Assignment = require("../../models/Assignment");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

// PATCH /api/assignments/teacher/:assignmentId/publish
async function teacherPublishAssignment(req, res) {
  try {
    const teacherId = req.user?._id || req.user?.id;
    const { assignmentId } = req.params;

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) {
      return res.status(400).json({ message: "assignmentId noto‘g‘ri" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment topilmadi" });

    if (String(assignment.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Bu assignment sizniki emas" });
    }

    assignment.status = "published";
    if (!assignment.publishAt) assignment.publishAt = new Date();

    await assignment.save();

    return res.json({
      message: "✅ Published",
      assignment,
    });
  } catch (err) {
    console.error("teacherPublishAssignment error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

module.exports = { teacherPublishAssignment };
