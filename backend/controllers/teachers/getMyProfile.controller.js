// backend/controllers/teachers/getMyProfile.controller.js
const User = require("../../models/User");

module.exports = async function getMyProfile(req, res) {
  try {
    const userId = req.user?._id;

    const u = await User.findById(userId)
      .select("_id name email role avatarUrl bio achievements teacherApprovalStatus certificates createdAt updatedAt")
      .lean();

    if (!u) return res.status(404).json({ message: "Teacher topilmadi" });

    return res.json(u);
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Server error", error: String(e?.message || e) });
  }
};
