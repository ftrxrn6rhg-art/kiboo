// backend/controllers/teachers/getMyVideos.controller.js
const VideoLesson = require("../../models/VideoLesson");

module.exports = async function getMyVideos(req, res) {
  try {
    const teacherId = req.user._id;

    const { subjectId, topicId, grade, status, q, page = 1, limit = 30 } = req.query;

    const filter = { teacher: teacherId };

    if (subjectId) filter.subject = subjectId;
    if (topicId) filter.topic = topicId;
    if (grade) filter.grade = Number(grade);
    if (status) filter.status = status;

    if (q) {
      filter.title = { $regex: String(q), $options: "i" };
    }

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 30));
    const skip = (p - 1) * l;

    const [count, videos] = await Promise.all([
      VideoLesson.countDocuments(filter),
      VideoLesson.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .select("_id title topic subject grade status hlsUrl createdAt updatedAt likes dislikes"),
    ]);

    const out = videos.map((v) => ({
      ...v.toObject(),
      likeCount: Array.isArray(v.likes) ? v.likes.length : 0,
      dislikeCount: Array.isArray(v.dislikes) ? v.dislikes.length : 0,
    }));

    return res.json({
      count,
      page: p,
      limit: l,
      videos: out,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};
