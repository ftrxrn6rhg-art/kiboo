// backend/controllers/parents/childCourses.controller.js
const mongoose = require("mongoose");
const ParentChildLink = require("../../models/ParentChildLink");
const User = require("../../models/User");
const Subscription = require("../../models/Subscription");
const StudentProgress = require("../../models/StudentProgress");
const CurriculumTopic = require("../../models/CurriculumTopic");

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(String(id || ""));
}

/**
 * GET /api/parents/children/:studentId/courses
 * Parent faqat o'zi bog'lagan (active) farzandini ko'ra oladi.
 * Qaytaradi:
 * - student basic info
 * - active subscription(lar)
 * - progress (current grade/topic)
 * - current grade bo'yicha topic list + state (completed/current/locked)
 */
exports.childCourses = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id;
    const { studentId } = req.params;

    if (!parentId) return res.status(401).json({ message: "Auth kerak" });
    if (!isValidId(studentId)) return res.status(400).json({ message: "studentId noto‘g‘ri" });

    // 1) Parent -> child link tekshiruv
    const link = await ParentChildLink.findOne({
      parent: parentId,
      student: studentId,
      isActive: true,
    }).select("_id parent student isActive createdAt");

    if (!link) {
      return res.status(403).json({ message: "Bu student sizga bog‘lanmagan (yoki inactive)" });
    }

    // 2) Student info
    const student = await User.findOne({ _id: studentId, role: "student" })
      .select("_id name email role grade")
      .lean();

    if (!student) return res.status(404).json({ message: "Student topilmadi" });

    // 3) Active subscription(lar)
    const subs = await Subscription.find({ student: studentId, status: "active" })
      .populate("subject", "_id name slug")
      .sort({ createdAt: -1 })
      .lean();

    const courses = [];

    for (const sub of subs) {
      const subjectId = sub?.subject?._id || sub?.subject;
      if (!subjectId) continue;

      // 4) Progress
      const sp = await StudentProgress.findOne({ student: studentId, subject: subjectId })
        .populate("currentTopic", "_id title order grade subject")
        .populate("subject", "_id name slug")
        .lean();

      const currentGrade = Number(sp?.currentGradeOrLevel || sub?.grade || student?.grade || 0) || 0;
      const curTopic = sp?.currentTopic || null;
      const curOrder = Number(curTopic?.order || 0);

      // 5) Topics for current grade
      let topics = [];
      if (currentGrade) {
        topics = await CurriculumTopic.find({
          subject: subjectId,
          grade: currentGrade,
        })
          .sort({ order: 1 })
          .select("_id title order grade subject")
          .lean();
      }

      // 6) State mapping (sequential rule)
      const topicItems = (Array.isArray(topics) ? topics : []).map((t) => {
        const o = Number(t?.order || 0);
        let state = "locked";

        if (!curTopic) {
          // progress yo‘q bo‘lsa: hammasi locked, faqat order=1 current deb ko‘rsatsak ham bo‘ladi,
          // lekin hozircha locked qoldiramiz.
          state = "locked";
        } else if (String(t._id) === String(curTopic._id)) {
          state = "current";
        } else if (o > 0 && curOrder > 0 && o < curOrder) {
          state = "completed";
        } else if (o > 0 && curOrder > 0 && o > curOrder) {
          state = "locked";
        }

        return {
          _id: t._id,
          title: t.title,
          order: t.order,
          grade: t.grade,
          state,
        };
      });

      courses.push({
        subscription: sub,
        progress: sp
          ? {
              _id: sp._id,
              subject: sp.subject,
              currentGradeOrLevel: sp.currentGradeOrLevel,
              currentTopic: sp.currentTopic,
              currentTopicCompleted: sp.currentTopicCompleted,
              lastSeenAt: sp.lastSeenAt,
              totalWatchSeconds: sp.totalWatchSeconds,
            }
          : null,
        current: {
          subject: sub.subject,
          grade: currentGrade || null,
          topic: curTopic
            ? { _id: curTopic._id, title: curTopic.title, order: curTopic.order, grade: curTopic.grade }
            : null,
        },
        topics: topicItems,
      });
    }

    return res.json({
      student,
      link,
      count: courses.length,
      courses,
    });
  } catch (e) {
    console.error("childCourses error:", e);
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
