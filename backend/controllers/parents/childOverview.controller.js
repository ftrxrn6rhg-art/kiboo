// backend/controllers/parents/childOverview.controller.js
const ParentChildLink = require("../../models/ParentChildLink");
const VideoProgress = require("../../models/VideoProgress");
const AssignmentAttempt = require("../../models/AssignmentAttempt");

const Subscription = require("../../models/Subscription");
const StudentProgress = require("../../models/StudentProgress");

exports.childOverview = async (req, res) => {
  try {
    const parentId = req.user?.id || req.user?._id;
    const { studentId } = req.params;

    const exists = await ParentChildLink.findOne({ parent: parentId, student: studentId }).lean();
    if (!exists) {
      return res.status(403).json({ message: "Bu student sizga bog‘lanmagan" });
    }

    // 0) active subscription + progress (REAL)
    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("subject", "name slug")
      .lean();

    let progress = null;
    if (sub?.subject?._id || sub?.subject) {
      const subjectId = sub.subject?._id || sub.subject;
      progress = await StudentProgress.findOne({ student: studentId, subject: subjectId })
        .populate("subject", "name slug")
        .populate("currentTopic", "grade order title")
        .lean();
    }

    const progressSummary = progress
      ? {
          subject: progress.subject || null,
          currentGradeOrLevel: progress.currentGradeOrLevel ?? null,
          currentTopic: progress.currentTopic || null,
          videoDoneCount: Array.isArray(progress.videoCompletedTopics) ? progress.videoCompletedTopics.length : 0,
          testDoneCount: Array.isArray(progress.testCompletedTopics) ? progress.testCompletedTopics.length : 0,
          fullDoneCount: Array.isArray(progress.completedTopics) ? progress.completedTopics.length : 0,
          totalWatchMinutes: Math.floor(Number(progress.totalWatchSeconds || 0) / 60),
          lastSeenAt: progress.lastSeenAt || null,
        }
      : null;

    // 1) lastActivity: video progressdan
    const lastProgress = await VideoProgress.findOne({ user: studentId })
      .sort({ updatedAt: -1 })
      .lean();

    // 2) lastActivity: quiz/assignment attemptdan (submitted)
    const lastAttempt = await AssignmentAttempt.findOne({
      student: studentId,
      status: "submitted",
    })
      .sort({ updatedAt: -1 })
      .populate("assignment", "title subject grade topic")
      .lean();

    // lastActivityAt = ikkovidan qaysi biri yangi bo‘lsa, o‘sha
    const pTime = lastProgress?.updatedAt ? new Date(lastProgress.updatedAt).getTime() : 0;
    const aTime = lastAttempt?.updatedAt ? new Date(lastAttempt.updatedAt).getTime() : 0;
    const lastActivityAt = pTime || aTime ? new Date(Math.max(pTime, aTime)).toISOString() : null;

    // Weekly simple stats (VideoProgress bo‘yicha)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const items = await VideoProgress.find({ user: studentId, updatedAt: { $gte: since } })
      .select("video status lastPositionSec completedAt updatedAt")
      .lean();

    const uniqueVideos = new Set(items.map((p) => String(p.video))).size;
    const completedCount = items.filter((p) => p.completedAt || p.status === "completed").length;
    const inProgressCount = items.filter((p) => !p.completedAt && Number(p.lastPositionSec || 0) > 0).length;

    // demo hisob (har progress update ~1min deb)
    const totalMinutes = Math.floor(
      items.reduce((sum, p) => sum + (Number(p.lastPositionSec || 0) > 0 ? 60 : 0), 0) / 60
    );

    // Oxirgi test natijasi (parent ko‘rishi uchun)
    const lastQuizResult = lastAttempt
      ? {
          attemptId: lastAttempt._id,
          assignmentId: lastAttempt.assignment?._id || lastAttempt.assignment,
          title: lastAttempt.assignment?.title || "",
          scorePercent: lastAttempt.scorePercent ?? 0,
          correctCount: lastAttempt.correctCount ?? 0,
          totalQuestions: lastAttempt.totalQuestions ?? 0,
          submittedAt: lastAttempt.updatedAt || lastAttempt.createdAt || null,
        }
      : null;

    return res.json({
      studentId,

      subscription: sub || null,
      progress: progressSummary,

      lastActivityAt,
      weekly: {
        totalMinutes,
        uniqueVideos,
        completedCount,
        inProgressCount,
      },
      lastQuizResult,

      top: {
        subjects: [],
        topics: [],
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
