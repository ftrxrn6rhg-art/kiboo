// backend/controllers/parents/linkChild.controller.js
const mongoose = require("mongoose");
const ParentStudent = require("../../models/ParentStudent");
const User = require("../../models/User");

module.exports = async function linkChild(req, res) {
  try {
    // parent login bo‘lgan bo‘lishi shart (protect qo‘ygan bo‘ladi)
    const parentId = req.user?._id;

    // eski variant: parentCode
    // yangi variant: studentId
    const { studentId, parentCode } = req.body;

    let student = null;

    // 1) Agar studentId kelsa — shuni ishlatamiz (eng oson)
    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "studentId noto‘g‘ri" });
      }

      student = await User.findById(studentId).select("_id role name email");
      if (!student) return res.status(404).json({ message: "Student topilmadi" });
      if (student.role !== "student") {
        return res.status(400).json({ message: "Bu user student emas" });
      }
    }

    // 2) Agar studentId bo‘lmasa, parentCode bilan qidiramiz
    // (agar keyin code funksiyasini qo‘shsak ishlaydi)
    if (!student && parentCode) {
      student = await User.findOne({ parentCode }).select("_id role name email");
      if (!student) return res.status(404).json({ message: "parentCode bo‘yicha student topilmadi" });
      if (student.role !== "student") {
        return res.status(400).json({ message: "Bu user student emas" });
      }
    }

    if (!student) {
      return res.status(400).json({ message: "studentId yoki parentCode majburiy" });
    }

    const link = await ParentStudent.create({
      parent: parentId,
      student: student._id,
      isActive: true,
    });

    return res.status(201).json({
      message: "Child linked ✅",
      link,
      student,
    });
  } catch (err) {
    // duplicate link bo‘lsa
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Bu child allaqachon bog‘langan" });
    }
    console.error("LINK CHILD ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};