// backend/controllers/parents/childAttempts.controller.js
const ParentChildLink = require("../../models/ParentChildLink");
const AssignmentAttempt = require("../../models/AssignmentAttempt");

exports.childAttempts = async (req, res) => {
  try {
    const parentId = req.user.id;
    const { studentId } = req.params;

    // 1) parent->child link check
    const exists = await ParentChildLink.findOne({ parent: parentId, student: studentId }).lean();
    if (!exists) {
      return res.status(403).json({ message: "Bu student sizga bog‘lanmagan" });
    }

    // 2) last attempts (submitted only)
    const rows = await AssignmentAttempt.find({
      student: studentId,
      status: "submitted",
    })
      .sort({ updatedAt: -1 })
      .limit(50)
      .populate("assignment", "title")
      .select("assignment scorePercent correctCount totalQuestions createdAt updatedAt")
      .lean();

    const attempts = (rows || []).map((a) => ({
      _id: a?._id,
      assignmentId: a?.assignment?._id || a?.assignment,
      title: a?.assignment?.title || "Test",
      scorePercent: a?.scorePercent ?? 0,
      correctCount: a?.correctCount ?? 0,
      totalQuestions: a?.totalQuestions ?? 0,
      submittedAt: a?.updatedAt || a?.createdAt || null,
    }));

    return res.json({ studentId, attempts });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
