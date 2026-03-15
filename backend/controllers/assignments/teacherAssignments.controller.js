// backend/controllers/assignments/teacherAssignments.controller.js
const mongoose = require("mongoose");

const Assignment = require("../../models/Assignment");
const AssignmentQuestion = require("../../models/AssignmentQuestion");
const AssignmentAttempt = require("../../models/AssignmentAttempt");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

// POST /api/assignments/teacher
// body: { title, description?, subjectId, grade, topicId, videoId?, status?, timeLimitSec?, deadline?, publishAt?, type? }
async function teacherCreateAssignment(req, res) {
  try {
    const teacherId = req.user?._id;
    const {
      title,
      description,
      subjectId,
      grade,
      topicId,
      videoId,
      status,
      timeLimitSec,
      deadline,
      publishAt,
      type,
    } = req.body || {};

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!title || !String(title).trim()) return res.status(400).json({ message: "title majburiy" });

    const payload = {
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      teacher: teacherId,
    };

    // required-ish (modelda required): subject, grade, topic
    if (subjectId && isValidObjectId(subjectId)) payload.subject = subjectId;
    if (topicId && isValidObjectId(topicId)) payload.topic = topicId;
    if (videoId && isValidObjectId(videoId)) payload.video = videoId;

    if (grade !== undefined && grade !== null && String(grade) !== "") {
      const g = Number(grade);
      if (!Number.isNaN(g)) payload.grade = g;
    }

    if (type) {
      const t = String(type).toLowerCase();
      payload.type = t === "test" ? "quiz" : t === "assignment" ? "file" : t;
    }
    if (status) payload.status = String(status).toLowerCase();

    if (timeLimitSec !== undefined && timeLimitSec !== null && String(timeLimitSec) !== "") {
      const t = Number(timeLimitSec);
      if (!Number.isNaN(t) && t > 0) payload.timeLimitSec = t;
    }

    if (deadline) payload.deadline = deadline;
    if (publishAt) payload.publishAt = publishAt;

    const a = await Assignment.create(payload);

    return res.status(201).json({
      message: "✅ Assignment yaratildi",
      assignment: a,
    });
  } catch (err) {
    console.error("teacherCreateAssignment error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// POST /api/assignments/teacher/:assignmentId/questions
// body: { question, options?, correctIndex?, explanation?, order? }
async function teacherAddQuestion(req, res) {
  try {
    const teacherId = req.user?._id;
    const { assignmentId } = req.params;

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) return res.status(400).json({ message: "assignmentId noto‘g‘ri" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment topilmadi" });

    if (String(assignment.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Bu assignment sizniki emas" });
    }

    const { question, options, correctIndex, explanation, order } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: "question majburiy" });
    }

    // order auto
    let nextOrder = 1;
    if (order !== undefined && order !== null && String(order) !== "") {
      const o = Number(order);
      if (!Number.isNaN(o) && o > 0) nextOrder = o;
    } else {
      const last = await AssignmentQuestion.find({ assignment: assignmentId })
        .sort({ order: -1 })
        .limit(1)
        .lean();
      if (last?.[0]?.order) nextOrder = Number(last[0].order) + 1;
    }

    const qPayload = {
      assignment: assignmentId,
      order: nextOrder,
      question: String(question).trim(),
    };

    if (Array.isArray(options) && options.length) {
      qPayload.options = options.map((x) => String(x));
    }

    if (correctIndex !== undefined && correctIndex !== null && String(correctIndex) !== "") {
      const idx = Number(correctIndex);
      if (!Number.isNaN(idx)) qPayload.correctIndex = idx;
    }

    if (explanation) qPayload.explanation = String(explanation).trim();

    const q = await AssignmentQuestion.create(qPayload);

    return res.status(201).json({
      message: "✅ Savol qo‘shildi",
      question: q,
    });
  } catch (err) {
    console.error("teacherAddQuestion error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// POST /api/assignments/teacher/:assignmentId/file
async function teacherUploadAssignmentFile(req, res) {
  try {
    const teacherId = req.user?._id;
    const { assignmentId } = req.params;

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) return res.status(400).json({ message: "assignmentId noto‘g‘ri" });
    if (!req.file) return res.status(400).json({ message: "Fayl majburiy" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment topilmadi" });
    if (String(assignment.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Bu assignment sizniki emas" });
    }

    assignment.fileUrl = `/uploads/assignments/${req.file.filename}`;
    assignment.fileName = req.file.originalname || "file";
    await assignment.save();

    return res.json({
      message: "✅ Fayl biriktirildi",
      assignment,
    });
  } catch (err) {
    console.error("teacherUploadAssignmentFile error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// PATCH /api/assignments/teacher/:assignmentId/publish
async function teacherPublishAssignment(req, res) {
  try {
    const teacherId = req.user?._id;
    const { assignmentId } = req.params;

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) return res.status(400).json({ message: "assignmentId noto‘g‘ri" });

    const a = await Assignment.findById(assignmentId);
    if (!a) return res.status(404).json({ message: "Assignment topilmadi" });

    if (String(a.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Bu assignment sizniki emas" });
    }

    // kamida 1 ta savol bo‘lsin
    const qCount = await AssignmentQuestion.countDocuments({ assignment: assignmentId });
    if (qCount < 1) {
      return res.status(400).json({ message: "Publish uchun kamida 1 ta savol kerak" });
    }

    a.status = "published";
    if (!a.publishAt) a.publishAt = new Date();

    await a.save();

    return res.json({
      message: "✅ Published",
      assignment: a,
    });
  } catch (err) {
    console.error("teacherPublishAssignment error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// DELETE /api/assignments/teacher/:assignmentId
async function teacherDeleteAssignment(req, res) {
  try {
    const teacherId = req.user?._id;
    const { assignmentId } = req.params;

    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidObjectId(assignmentId)) return res.status(400).json({ message: "assignmentId noto‘g‘ri" });

    const a = await Assignment.findById(assignmentId);
    if (!a) return res.status(404).json({ message: "Assignment topilmadi" });

    if (String(a.teacher) !== String(teacherId)) {
      return res.status(403).json({ message: "Bu assignment sizniki emas" });
    }

    await AssignmentQuestion.deleteMany({ assignment: assignmentId });
    await AssignmentAttempt.deleteMany({ assignment: assignmentId });
    await Assignment.deleteOne({ _id: assignmentId });

    return res.json({ message: "✅ Assignment o‘chirildi" });
  } catch (err) {
    console.error("teacherDeleteAssignment error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

// GET /api/assignments/teacher
async function teacherGetMyAssignments(req, res) {
  try {
    const teacherId = req.user?._id;
    if (!teacherId) return res.status(401).json({ message: "Auth kerak" });

    const list = await Assignment.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .lean();

    const ids = list.map((a) => a._id);
    const counts = await AssignmentQuestion.aggregate([
      { $match: { assignment: { $in: ids } } },
      { $group: { _id: "$assignment", count: { $sum: 1 } } },
    ]);

    const map = new Map(counts.map((x) => [String(x._id), x.count]));

    const out = list.map((a) => ({
      ...a,
      questionCount: map.get(String(a._id)) || 0,
      likeCount: Array.isArray(a.likes) ? a.likes.length : 0,
      dislikeCount: Array.isArray(a.dislikes) ? a.dislikes.length : 0,
    }));

    return res.json({ count: out.length, assignments: out });
  } catch (err) {
    console.error("teacherGetMyAssignments error:", err);
    return res.status(500).json({ message: "Server xatosi", error: err.message });
  }
}

module.exports = {
  teacherCreateAssignment,
  teacherAddQuestion,
  teacherPublishAssignment,
  teacherGetMyAssignments,
  teacherDeleteAssignment,
  teacherUploadAssignmentFile,
};
