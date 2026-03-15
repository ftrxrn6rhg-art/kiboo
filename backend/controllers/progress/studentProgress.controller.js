// backend/controllers/progress/studentProgress.controller.js
const mongoose = require("mongoose");
const Subscription = require("../../models/Subscription");
const StudentProgress = require("../../models/StudentProgress");
const CurriculumTopic = require("../../models/CurriculumTopic");

/**
 * Helper: subject bo‘yicha eng birinchi topic (grade asc, order asc)
 */
async function findFirstTopic(subjectId) {
  return CurriculumTopic.findOne({ subject: subjectId })
    .sort({ grade: 1, order: 1 })
    .select("_id grade order title subject")
    .lean();
}

/**
 * POST /api/progress/ensure
 * Studentning active subscription’i bo‘yicha StudentProgress hujjatini yaratadi (yoki tuzatadi)
 */
exports.ensureMyProgress = async (req, res, next) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "studentId noto'g'ri" });
    }

    // 1) Active subscription topamiz
    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("subject", "name slug")
      .lean();

    if (!sub) {
      return res.json({ status: "no-subscription", progress: null });
    }

    const subjectId = sub.subject?._id || sub.subject;

    // 2) Subject bo‘yicha birinchi topicni topamiz (masalan Fizika uchun grade=6 bo‘ladi)
    const firstTopic = await findFirstTopic(subjectId);

    // 3) Progressni topamiz yoki yaratamiz
    let doc = await StudentProgress.findOne({ student: studentId, subject: subjectId });

    if (!doc) {
      doc = await StudentProgress.create({
        student: studentId,
        subject: subjectId,
        currentGradeOrLevel: firstTopic?.grade ?? 5,
        currentTopic: firstTopic?._id ?? null,
        currentTopicCompleted: false,
        totalWatchSeconds: 0,
        lastSeenAt: null,
      });

      const populated = await StudentProgress.findById(doc._id)
        .populate("subject", "name slug")
        .lean();

      return res.json({
        status: "created",
        subscription: sub,
        firstTopic: firstTopic || null,
        progress: populated,
      });
    }

    // 4) Agar progress bor-u, lekin topic yo‘q / noto‘g‘ri grade’da qolib ketgan bo‘lsa — tuzatamiz
    let needsFix = false;

    if (!doc.currentTopic && firstTopic?._id) {
      doc.currentTopic = firstTopic._id;
      needsFix = true;
    }

    if (firstTopic?.grade && Number(doc.currentGradeOrLevel) !== Number(firstTopic.grade) && !doc.currentTopicCompleted) {
      // faqat hali topic completion bo‘lmagan bo‘lsa start grade’ni to‘g‘rilaymiz
      doc.currentGradeOrLevel = firstTopic.grade;
      needsFix = true;
    }

    if (needsFix) {
      await doc.save();
    }

    const populated = await StudentProgress.findById(doc._id)
      .populate("subject", "name slug")
      .populate("currentTopic", "grade order title")
      .lean();

    return res.json({
      status: needsFix ? "fixed" : "ok",
      subscription: sub,
      firstTopic: firstTopic || null,
      progress: populated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/progress/plan
 * Subscription + progress + currentTopic info (UI uchun)
 */
exports.getMyPlan = async (req, res, next) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("subject", "name slug")
      .lean();

    if (!sub) {
      return res.json({ status: "no-subscription", subscription: null, progress: null });
    }

    const subjectId = sub.subject?._id || sub.subject;

    const progress = await StudentProgress.findOne({ student: studentId, subject: subjectId })
      .select("student subject currentGradeOrLevel currentTopic videoCompletedTopics testCompletedTopics completedTopics totalWatchSeconds lastSeenAt")
      .populate("subject", "name slug")
      .populate("currentTopic", "grade order title")
      .lean();

    return res.json({
      status: "ok",
      subscription: sub,
      progress: progress || null,
    });
  } catch (err) {
    next(err);
  }
};
/**
 * GET /api/progress/current
 * Student uchun: hozirgi ochiq topic + shu topic videolari
 * Qoidaga mos: subscription + studentProgress asosida
 */
exports.getMyCurrentContent = async (req, res, next) => {
  try {
    const mongoose = require("mongoose");
    const Subscription = require("../../models/Subscription");
    const StudentProgress = require("../../models/StudentProgress");
    const CurriculumTopic = require("../../models/CurriculumTopic");
    const VideoLesson = require("../../models/VideoLesson");

    const studentId = req.user?.id || req.user?._id;

    const sub = await Subscription.findOne({ student: studentId, status: "active" }).populate(
      "subject",
      "name slug"
    );

    if (!sub) {
      return res.json({
        status: "no_subscription",
        subscription: null,
        progress: null,
        topic: null,
        videos: [],
      });
    }

    let progress = await StudentProgress.findOne({ student: studentId, subject: sub.subject._id })
      .populate("subject", "name slug")
      .populate("currentTopic", "order grade title")
      .lean();

    if (!progress) {
      // ensure qilinmagan bo‘lsa ham ishlayveradi
      progress = await StudentProgress.create({
        student: studentId,
        subject: sub.subject._id,
        currentGradeOrLevel: 5,
        currentTopic: null,
        currentTopicCompleted: false,
      });
      progress = await StudentProgress.findById(progress._id)
        .populate("subject", "name slug")
        .populate("currentTopic", "order grade title")
        .lean();
    }

    // Agar currentTopic yo‘q bo‘lsa — birinchi topicni topamiz
    let currentTopic = progress.currentTopic || null;

    if (!currentTopic) {
      const first = await CurriculumTopic.findOne({
        subject: sub.subject._id,
        grade: progress.currentGradeOrLevel,
      })
        .sort({ order: 1, _id: 1 })
        .lean();

      if (first) {
        await StudentProgress.updateOne(
          { _id: progress._id },
          { $set: { currentTopic: first._id, currentTopicCompleted: false } }
        );

        currentTopic = first;
        progress.currentTopic = {
          _id: first._id,
          order: first.order,
          grade: first.grade,
          title: first.title,
        };
      }
    }

    // Shu topic bo‘yicha videolar (faqat ready)
    let videos = [];
    if (currentTopic?._id && mongoose.isValidObjectId(currentTopic._id)) {
      videos = await VideoLesson.find({
        subject: sub.subject._id,
        grade: Number(progress.currentGradeOrLevel),
        topic: currentTopic._id,
        status: "ready",
      })
        .sort({ createdAt: 1 })
        .select("_id title status hlsUrl createdAt updatedAt topic subject grade")
        .lean();
    }

    return res.json({
      status: "ok",
      subscription: sub,
      progress,
      topic: currentTopic,
      videos,
    });
  } catch (err) {
    next(err);
  }
};