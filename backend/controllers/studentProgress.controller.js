const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const StudentProgress = require("../models/StudentProgress");
const CurriculumTopic = require("../models/CurriculumTopic");
const Subject = require("../models/Subject");

function isExpired(endDate) {
  if (!endDate) return false;
  return new Date(endDate) <= new Date();
}

// Subject tilmi? (ingliz tili va keyin boshqa tillar ham shu pattern)
function isLanguageSubject(subjectDoc) {
  const slug = (subjectDoc?.slug || "").toLowerCase();
  const name = (subjectDoc?.name || "").toLowerCase();
  return (
    slug.includes("ingliz") ||
    slug.includes("english") ||
    name.includes("ingliz") ||
    name.includes("english")
  );
}

// Subject bo‘yicha eng kichik mavjud grade ni topamiz (masalan Fizika => 6)
async function getFirstAvailableGrade(subjectId) {
  const agg = await CurriculumTopic.aggregate([
    { $match: { subject: new mongoose.Types.ObjectId(String(subjectId)) } },
    { $group: { _id: "$grade" } },
    { $sort: { _id: 1 } },
    { $limit: 1 },
  ]);

  if (!agg?.length) return null;
  return Number(agg[0]._id);
}

async function getFirstTopicId(subjectId, grade) {
  const t = await CurriculumTopic.findOne({ subject: subjectId, grade })
    .sort({ order: 1, _id: 1 })
    .select("_id")
    .lean();
  return t?._id || null;
}

/**
 * POST /api/progress/ensure
 * Studentning active subscriptioniga qarab StudentProgress yaratadi yoki tuzatadi.
 * Qoidalar:
 * - Fanlar: eng kichik mavjud grade'dan boshlaydi (5 bo‘lsa 5, bo‘lmasa 6, ...)
 * - Tillar: level=1 dan boshlaydi
 */
exports.ensure = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    // 1) Active subscriptionni topamiz
    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("subject", "name slug")
      .lean();

    if (!sub) {
      return res.status(400).json({
        message: "Active subscription yo‘q. Avval obuna bo‘ling.",
      });
    }

    // subscription muddati o‘tgan bo‘lsa — expired qilib yuboramiz
    if (isExpired(sub.endDate)) {
      await Subscription.findByIdAndUpdate(sub._id, { status: "expired" });
      return res.status(400).json({
        message: "Subscription muddati tugagan (expired).",
      });
    }

    const subjectId = sub.subject?._id || sub.subject;
    const subjectDoc =
      typeof sub.subject === "object" && sub.subject?.name
        ? sub.subject
        : await Subject.findById(subjectId).select("name slug").lean();

    // 2) Start grade/level ni aniqlaymiz
    let startGradeOrLevel = 1; // default language
    if (!isLanguageSubject(subjectDoc)) {
      const firstGrade = await getFirstAvailableGrade(subjectId);
      if (!firstGrade) {
        return res.status(400).json({
          message: "Bu fan bo‘yicha curriculum topics topilmadi.",
        });
      }
      startGradeOrLevel = firstGrade;
    }

    // 3) Birinchi topic (fanlar uchun) — grade ichida order=1
    const firstTopicId = isLanguageSubject(subjectDoc)
      ? await getFirstTopicId(subjectId, startGradeOrLevel) // agar til topics ham grade=level qilib kiritilgan bo‘lsa ishlaydi
      : await getFirstTopicId(subjectId, startGradeOrLevel);

    // 4) Mavjud progress bormi?
    let existing = await StudentProgress.findOne({ student: studentId, subject: subjectId })
      .populate("subject", "name slug")
      .lean();

    // 5) Agar progress yo‘q bo‘lsa — create
    if (!existing) {
      const created = await StudentProgress.create({
        student: studentId,
        subject: subjectId,
        currentGradeOrLevel: startGradeOrLevel,
        currentTopic: firstTopicId,
        currentTopicCompleted: false,
        totalWatchSeconds: 0,
        lastSeenAt: null,
      });

      const populated = await StudentProgress.findById(created._id)
        .populate("subject", "name slug")
        .lean();

      return res.json({ status: "created", progress: populated });
    }

    // 6) Agar progress bor bo‘lsa — noto‘g‘ri boshlangan bo‘lsa TUZATAMIZ
    // Masalan: Fizika currentGradeOrLevel=5, lekin 5 da topics yo‘q => 6 ga ko‘chiramiz
    const hasTopicsInCurrent = await CurriculumTopic.exists({
      subject: subjectId,
      grade: existing.currentGradeOrLevel,
    });

    let needUpdate = false;
    const patch = {};

    if (!hasTopicsInCurrent) {
      patch.currentGradeOrLevel = startGradeOrLevel;
      patch.currentTopic = firstTopicId;
      patch.currentTopicCompleted = false;
      needUpdate = true;
    } else if (!existing.currentTopic) {
      patch.currentTopic = firstTopicId;
      needUpdate = true;
    }

    if (needUpdate) {
      const updated = await StudentProgress.findOneAndUpdate(
        { student: studentId, subject: subjectId },
        { $set: patch },
        { new: true }
      )
        .populate("subject", "name slug")
        .lean();

      return res.json({ status: "updated", progress: updated });
    }

    // 7) Hammasi joyida bo‘lsa — existing qaytaramiz
    return res.json({ status: "existing", progress: existing });
  } catch (err) {
    console.error("ensure progress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/progress/me
 * Studentning barcha progresslari (keyin parent panel/analyticsga ham ishlatamiz)
 */
exports.my = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;

    const items = await StudentProgress.find({ student: studentId })
      .sort({ updatedAt: -1 })
      .populate("subject", "name slug")
      .populate("currentTopic", "title grade order")
      .lean();

    return res.json({ count: items.length, progress: items });
  } catch (err) {
    console.error("my progress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
