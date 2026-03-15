// backend/controllers/teachers/uploadMyCertificate.controller.js
const User = require("../../models/User");

module.exports = async function uploadMyCertificate(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Sertifikat fayli majburiy (PDF/JPG/PNG/WEBP)" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Teacher topilmadi" });

    const cert = {
      url: `/uploads/certificates/${req.file.filename}`,
      name: req.file.originalname || "certificate",
      uploadedAt: new Date(),
    };

    user.certificates = Array.isArray(user.certificates) ? user.certificates : [];
    user.certificates.push(cert);

    if (user.teacherApprovalStatus !== "approved") {
      user.teacherApprovalStatus = "pending";
      user.teacherApprovedAt = null;
      user.teacherApprovedBy = null;
    }

    await user.save();

    return res.json({
      message: "✅ Sertifikat yuklandi",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        teacherApprovalStatus: user.teacherApprovalStatus,
        certificates: user.certificates,
      },
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
