// backend/controllers/users/uploadAvatar.controller.js
const User = require("../../models/User");

module.exports = async function uploadAvatarController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Rasm fayl topilmadi" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true }
    ).select("_id name email role avatarUrl grade");

    return res.json({
      message: "Avatar saqlandi ✅",
      user,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Server error", error: String(e?.message || e) });
  }
};