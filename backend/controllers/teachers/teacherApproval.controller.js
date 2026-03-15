// backend/controllers/teachers/teacherApproval.controller.js
const User = require("../../models/User");

async function listTeachers(req, res) {
  try {
    const teachers = await User.find({ role: "teacher" })
      .select("_id name email teacherApprovalStatus certificates createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ count: teachers.length, teachers });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}

async function approveTeacher(req, res) {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      {
        teacherApprovalStatus: "approved",
        teacherApprovedAt: new Date(),
        teacherApprovedBy: req.user?._id || null,
      },
      { new: true }
    ).select("_id name email teacherApprovalStatus certificates");
    if (!updated) return res.status(404).json({ message: "Teacher topilmadi" });
    return res.json({ message: "✅ Approved", teacher: updated });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}

async function rejectTeacher(req, res) {
  try {
    const { id } = req.params;
    const updated = await User.findByIdAndUpdate(
      id,
      {
        teacherApprovalStatus: "rejected",
        teacherApprovedAt: null,
        teacherApprovedBy: req.user?._id || null,
      },
      { new: true }
    ).select("_id name email teacherApprovalStatus certificates");
    if (!updated) return res.status(404).json({ message: "Teacher topilmadi" });
    return res.json({ message: "✅ Rejected", teacher: updated });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
}

module.exports = { listTeachers, approveTeacher, rejectTeacher };
