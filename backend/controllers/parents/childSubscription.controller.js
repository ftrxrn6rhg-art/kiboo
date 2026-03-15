// backend/controllers/parents/childSubscription.controller.js
const mongoose = require("mongoose");
const ParentChildLink = require("../../models/ParentChildLink");
const Subscription = require("../../models/Subscription");
const Subject = require("../../models/Subject");
const User = require("../../models/User");

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + Number(months || 0));
  return d;
}

async function ensureLinkedParentChild(parentId, studentId) {
  if (!mongoose.isValidObjectId(studentId)) {
    return { ok: false, status: 400, message: "studentId noto'g'ri" };
  }

  const link = await ParentChildLink.findOne({
    parent: parentId,
    student: studentId,
    isActive: true,
  }).select("_id");

  if (!link) {
    return { ok: false, status: 403, message: "Bu student sizga bog'lanmagan" };
  }

  const student = await User.findById(studentId).select("_id role name email");
  if (!student || student.role !== "student") {
    return { ok: false, status: 404, message: "Student topilmadi" };
  }

  return { ok: true, student };
}

// GET /api/parents/children/:studentId/subscription
exports.childSubscription = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id;
    const { studentId } = req.params;

    const ok = await ensureLinkedParentChild(parentId, studentId);
    if (!ok.ok) return res.status(ok.status).json({ message: ok.message });

    const sub = await Subscription.findOne({ student: studentId, status: "active" })
      .populate("subject", "name slug")
      .populate("student", "name email role");

    if (!sub) {
      return res.json({ status: "none", subscription: null });
    }

    if (sub.endDate && new Date(sub.endDate) <= new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.json({ status: "expired", subscription: sub });
    }

    return res.json({ status: "active", subscription: sub });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err?.message || err) });
  }
};

// POST /api/parents/children/:studentId/subscribe
// body: { subjectId, months }
exports.subscribeChild = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id;
    const { studentId } = req.params;
    const { subjectId, months = 1 } = req.body || {};

    const ok = await ensureLinkedParentChild(parentId, studentId);
    if (!ok.ok) return res.status(ok.status).json({ message: ok.message });

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "subjectId noto'g'ri" });
    }

    const m = Number(months);
    if (![1, 3, 12].includes(m)) {
      return res.status(400).json({ message: "months faqat 1, 3 yoki 12 bo'lishi mumkin" });
    }

    const subject = await Subject.findById(subjectId).select("_id name slug");
    if (!subject) return res.status(404).json({ message: "Subject topilmadi" });

    const existing = await Subscription.findOne({ student: studentId, status: "active" });
    if (existing && String(existing.subject) !== String(subjectId)) {
      return res.status(400).json({
        message: "Studentda boshqa fan bo'yicha active obuna bor. Avval uni expired qiling.",
      });
    }

    if (existing && String(existing.subject) === String(subjectId)) {
      return res.status(400).json({ message: "Bu fan bo'yicha allaqachon active obuna bor" });
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
    await sub.populate("student", "name email role");

    return res.json({ message: "Subscription yaratildi ✅", subscription: sub });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: String(err?.message || err) });
  }
};
