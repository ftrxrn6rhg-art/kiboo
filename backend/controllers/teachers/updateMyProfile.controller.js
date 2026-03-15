// backend/controllers/teachers/updateMyProfile.controller.js
const User = require("../../models/User");

module.exports = async function updateMyProfile(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Token yo‘q" });

    const { name, bio, achievements } = req.body || {};

    const updates = {};
    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof achievements === "string") updates.achievements = achievements.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Hech narsa yuborilmadi (name kerak)" });
    }

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      select: "_id name email role avatarUrl bio achievements teacherApprovalStatus certificates createdAt updatedAt",
    });

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
