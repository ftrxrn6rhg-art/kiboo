// backend/controllers/videos/getVideoById.controller.js
const VideoLesson = require("../../models/VideoLesson");

module.exports = async function getVideoById(req, res) {
  try {
    const { id } = req.params;
    const role = req.user?.role;
    const userId = String(req.user?._id || "");

    const video = await VideoLesson.findById(id)
      .select(
        "_id title topic subject grade status hlsUrl fileUrl duration thumbnailUrl createdAt updatedAt teacher"
      )
      .lean();

    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    // ✅ Teacher faqat o‘z videosini ko‘ra oladi
    if (role === "teacher" && String(video.teacher) !== userId) {
      return res.status(403).json({ message: "Ruxsat yo‘q" });
    }

    // ✅ Student faqat ready videoni ko‘ra oladi
    if (role === "student" && video.status !== "ready" && !video.fileUrl) {
      return res.status(403).json({ message: "Video hali tayyor emas" });
    }

    // ✅ Admin hammasini ko‘ra oladi
    if (!["teacher", "student", "admin"].includes(role)) {
      return res.status(403).json({ message: "Ruxsat yo‘q" });
    }

    return res.json(video);
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: String(e?.message || e),
    });
  }
};
