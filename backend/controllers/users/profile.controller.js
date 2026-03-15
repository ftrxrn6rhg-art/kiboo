// backend/controllers/users/profile.controller.js
const path = require("path");
const User = require("../../models/User");

// GET /api/users/me
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "_id name email role avatarUrl goal bio achievements parentCode teacherApprovalStatus certificates createdAt updatedAt"
    );
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};

// POST /api/users/me/avatar  (form-data: avatar=<file>)
exports.updateMyAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Rasm topilmadi (avatar)" });

    // URL ko‘rinishi: /uploads/avatars/filename.jpg
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select("_id name email role avatarUrl goal bio achievements parentCode teacherApprovalStatus certificates createdAt updatedAt");

    return res.json({ message: "Avatar yangilandi ✅", user });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};


/* =========================
   PATCH /api/users/me
   body: { name?, goal?, bio?, achievements? }
   ========================= */
async function updateMyProfile(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Auth kerak" });

    const body = req.body || {};
    const updates = {};

    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.goal === "string") updates.goal = body.goal.trim();
    if (typeof body.bio === "string") updates.bio = body.bio.trim();
    if (typeof body.achievements === "string") updates.achievements = body.achievements.trim();

    const User = require("../../models/User");
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select("_id name email role avatarUrl goal bio achievements parentCode teacherApprovalStatus certificates");

    return res.json({ message: "✅ Profil saqlandi", user });
  } catch (e) {
    return res.status(500).json({ message: "Server xatosi", error: e.message });
  }
}

// Export (har xil uslubga mos)
exports.updateMyProfile = updateMyProfile;

// Agar module.exports = { ... } bo‘lsa, ichiga ham qo‘shib qo‘yamiz
if (typeof module.exports === "object" && module.exports) {
  module.exports.updateMyProfile = updateMyProfile;
}
