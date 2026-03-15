const mongoose = require("mongoose");
const VideoLesson = require("../../models/VideoLesson");

module.exports = async function updateVideo(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Video ID noto'g'ri" });
    }

    const video = await VideoLesson.findById(id);
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    // faqat o'z videosini teacher edit qila oladi (admin ham bo'lishi mumkin)
    const isAdmin = String(req.user?.role || "").toLowerCase() === "admin";
    const isOwner = String(video.teacher) === String(req.user?._id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Ruxsat yo'q (faqat o'z videongiz)" });
    }

    const rawTitle = req.body?.title;
    const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

    if (!title) {
      return res.status(400).json({ message: "title majburiy" });
    }
    if (title.length > 140) {
      return res.status(400).json({ message: "title juda uzun (max 140)" });
    }

    video.title = title;
    await video.save();

    return res.json({
      message: "✅ Video yangilandi",
      video: { _id: video._id, title: video.title, updatedAt: video.updatedAt },
    });
  } catch (e) {
    return res.status(500).json({ message: "update error", error: String(e?.message || e) });
  }
};
