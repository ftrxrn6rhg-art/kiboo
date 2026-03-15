// backend/controllers/teachers/uploadMyAvatar.controller.js
const User = require("../../models/User");

module.exports = async function uploadMyAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "avatar fayl majburiy (jpg/png/webp)" });
    }

    // multer destination: uploads/avatars
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatarUrl },
      { new: true, runValidators: true }
    ).select("_id name email role avatarUrl createdAt updatedAt");

    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
