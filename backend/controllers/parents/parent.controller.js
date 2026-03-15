// backend/controllers/parents/parent.controller.js
const ParentChildLink = require("../../models/ParentChildLink");
const User = require("../../models/User");

exports.linkChild = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id; // ✅ FIX
    const { studentId, parentCode } = req.body || {};

    if (!parentId) {
      return res.status(401).json({ message: "Auth kerak" });
    }

    let student = null;

    if (studentId) {
      student = await User.findOne({ _id: studentId, role: "student" }).select("_id name email role grade parentCode");
      if (!student) {
        return res.status(404).json({ message: "Student topilmadi" });
      }
    }

    if (!student && parentCode) {
      const code = String(parentCode).trim();
      if (!code) {
        return res.status(400).json({ message: "parentCode noto'g'ri" });
      }
      student = await User.findOne({ parentCode: code, role: "student" }).select("_id name email role grade parentCode");
      if (!student) {
        return res.status(404).json({ message: "parentCode bo'yicha student topilmadi" });
      }
    }

    if (!student) {
      return res.status(400).json({ message: "studentId yoki parentCode majburiy" });
    }

    const sid = String(student._id);

    let link = await ParentChildLink.findOne({ parent: parentId, student: sid });

    if (!link) {
      link = await ParentChildLink.create({
        parent: parentId,
        student: sid,
        isActive: true,
      });
    } else {
      link.isActive = true;
      await link.save();
    }

    return res.json({
      message: "Child linked ✅",
      link,
      student,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};


exports.unlinkChild = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id;
    const { studentId } = req.params || {};

    if (!parentId) return res.status(401).json({ message: "Auth kerak" });
    if (!studentId) return res.status(400).json({ message: "studentId kerak" });

    const link = await ParentChildLink.findOne({ parent: parentId, student: studentId });
    if (!link) return res.status(404).json({ message: "Link topilmadi" });

    link.isActive = false;
    await link.save();

    return res.json({ message: "Child unlinked ✅" });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};

exports.listChildren = async (req, res) => {
  try {
    const parentId = req.user?._id || req.user?.id; // ✅ FIX

    if (!parentId) {
      return res.status(401).json({ message: "Auth kerak" });
    }

    const links = await ParentChildLink.find({ parent: parentId, isActive: true })
      .populate("student", "_id name email role grade")
      .sort({ createdAt: -1 });

    const children = links
      .filter((l) => l.student)
      .map((l) => ({
        studentId: String(l.student._id),
        name: l.student.name,
        email: l.student.email,
        grade: l.student.grade ?? null,
        status: l.isActive ? "active" : "inactive",
        linkCreatedAt: l.createdAt,
      }));

    return res.json({ children });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
