// backend/controllers/videos/getVideos.controller.js
const VideoLesson = require("../../models/VideoLesson");

function escapeRegExp(str = "") {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = async function getVideos(req, res) {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;

    // query filters
    const { topicId, subjectId, grade, status, q } = req.query;

    let filter = {};

    // ✅ Role-based base filter
    if (role === "teacher") {
      filter.teacher = userId;
      // teacher status filter allowed (optional)
      if (status) filter.status = String(status);
    } else if (role === "student") {
      // student: HLS ready yoki raw file bo'lsa
      filter.$or = [
        { status: "ready" },
        { fileUrl: { $exists: true, $ne: "" } },
      ];
    } else if (role === "admin") {
      // admin hammasi, status optional
      if (status) filter.status = String(status);
    } else {
      return res.status(403).json({ message: "Ruxsat yo‘q" });
    }

    // ✅ Additional filters (works for all roles)
    if (topicId) filter.topic = String(topicId);
    if (subjectId) filter.subject = String(subjectId);
    if (grade !== undefined && grade !== null && String(grade).trim() !== "") {
      const g = Number(grade);
      if (!Number.isNaN(g)) filter.grade = g;
    }

    if (q && String(q).trim()) {
      const rx = new RegExp(escapeRegExp(String(q).trim()), "i");
      filter.title = rx;
    }

    const videos = await VideoLesson.find(filter)
      .sort({ createdAt: -1 })
      .select("_id title topic subject grade status hlsUrl createdAt teacher likes dislikes")
      .populate("teacher", "name email");

    return res.json({
      count: videos.length,
      videos: videos.map((v) => ({
        ...v.toObject(),
        likeCount: Array.isArray(v.likes) ? v.likes.length : 0,
        dislikeCount: Array.isArray(v.dislikes) ? v.dislikes.length : 0,
      })),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Server error", error: String(e?.message || e) });
  }
};
