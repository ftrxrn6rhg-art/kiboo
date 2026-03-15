// backend/controllers/subscriptionController.js
const mongoose = require("mongoose");
const Subscription = require("../models/Subscription");
const User = require("../models/User");
const Subject = require("../models/Subject");

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months || 0));
  return d;
}

/**
 * GET /api/subscriptions/me
 * Student o'zining ACTIVE obunasini ko'radi (yo'q bo'lsa: null)
 */
exports.getMySubscription = async (req, res, next) => {
  try {
    const studentId = req.user?.id;

    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("student", "name email role")
      .populate("subject", "name slug");

    if (!sub) {
      return res.json({ status: "none", subscription: null });
    }

    // agar muddati o'tgan bo'lsa — expired qilib qo'yamiz
    if (sub.endDate && new Date(sub.endDate) <= new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.json({ status: "expired", subscription: sub });
    }

    return res.json({ status: "active", subscription: sub });
  } catch (err) {
    next(err);
  }
};
/**
 * POST /api/subscriptions/activate/:studentId
 * Admin studentga obuna yoqadi
 * body: { subjectId, months: 1|3|12 }
 */
exports.activateSubscription = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { subjectId, months = 1 } = req.body || {};

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "studentId noto'g'ri" });
    }
    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "subjectId noto'g'ri" });
    }

    const m = Number(months);
    if (![1, 3, 12].includes(m)) {
      return res.status(400).json({ message: "months faqat 1, 3 yoki 12 bo'lishi mumkin" });
    }

    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student topilmadi" });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: "Subject topilmadi" });

    // ✅ admin ham 1 student = 1 active qoidasiga bo'ysin
    const existing = await Subscription.findOne({ student: studentId, status: "active" });
    if (existing && String(existing.subject) !== String(subjectId)) {
      return res.status(400).json({
        message: "Studentda boshqa fan bo'yicha active obuna bor. Avval uni expired qiling.",
      });
    }

    const startDate = new Date();
    const endDate = addMonths(startDate, m);

    const sub = await Subscription.findOneAndUpdate(
      { student: studentId, subject: subjectId, status: "active" },
      { student: studentId, subject: subjectId, startDate, endDate, status: "active" },
      { new: true, upsert: true }
    )
      .populate("student", "name email role")
      .populate("subject", "name slug");

    return res.json({ message: "Subscription active qilindi ✅", subscription: sub });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/subscriptions/deactivate/:studentId
 * Admin studentning ACTIVE obunasini expired qiladi
 * body: { subjectId }  (majburiy)
 */
exports.deactivateSubscription = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { subjectId } = req.body || {};

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ message: "studentId noto'g'ri" });
    }
    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "subjectId noto'g'ri" });
    }

    const sub = await Subscription.findOneAndUpdate(
      { student: studentId, subject: subjectId, status: "active" },
      { status: "expired", endDate: new Date() },
      { new: true }
    )
      .populate("student", "name email role")
      .populate("subject", "name slug");

    if (!sub) return res.status(404).json({ message: "Active subscription topilmadi" });

    return res.json({ message: "Subscription o‘chirildi ✅", subscription: sub });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/subscriptions/subscribe
 * Student o'zi fan uchun obuna bo'ladi
 * body: { subjectId, months: 1|3|12 }
 */
exports.subscribeStudent = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { subjectId, months = 1 } = req.body || {};

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "subjectId noto'g'ri" });
    }

    const m = Number(months);
    if (![1, 3, 12].includes(m)) {
      return res.status(400).json({ message: "months faqat 1, 3 yoki 12 bo'lishi mumkin" });
    }

    // subject borligini tekshiramiz
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Subject topilmadi" });
    }

    // shu fan bo‘yicha active obuna bormi?
    const existing = await Subscription.findOne({
      student: studentId,
      subject: subjectId,
      status: "active",
    });

    if (existing) {
      return res.status(400).json({
        message: "Bu fan bo‘yicha sizda allaqachon active obuna bor",
      });
    }

    const startDate = new Date();
    const endDate = addMonths(startDate, m);

    const sub = await Subscription.create({
      student: studentId,
      subject: subjectId,
      startDate,
      endDate,
      status: "active",
    });

    await sub.populate("subject", "name slug");

    return res.json({
      message: "Subscription muvaffaqiyatli yaratildi ✅",
      subscription: sub,
    });
  } catch (err) {
    next(err);
  }
};
