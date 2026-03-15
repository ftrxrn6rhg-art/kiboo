// backend/controllers/teachers/videoStats.controller.js
const VideoLesson = require("../../models/VideoLesson");

module.exports = async function videoStats(req, res) {
  try {
    const teacherId = req.user._id;

    const items = await VideoLesson.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .select("_id title status createdAt");

    const summary = {
      totalVideos: items.length,
      readyVideos: 0,
      uploadedVideos: 0,
      processingVideos: 0,
      failedVideos: 0,
    };

    for (const v of items) {
      if (v.status === "ready") summary.readyVideos++;
      else if (v.status === "uploaded") summary.uploadedVideos++;
      else if (v.status === "processing") summary.processingVideos++;
      else if (v.status === "failed") summary.failedVideos++;
    }

    return res.json({ count: items.length, items, summary });
  } catch (e) {
    return res.status(500).json({ message: "Server error", error: String(e?.message || e) });
  }
};