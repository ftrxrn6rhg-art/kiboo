// backend/controllers/videos/uploadVideo.controller.js
const VideoLesson = require("../../models/VideoLesson");
const CurriculumTopic = require("../../models/CurriculumTopic");

// ✅ BullMQ queue (agar senda bor bo‘lsa)
let videoQueue = null;
try {
  ({ videoQueue } = require("../../src/jobs/transcode/queue"));
} catch (e) {
  videoQueue = null;
}

module.exports = async function uploadVideo(req, res) {
  try {
    // title/topicId ni xavfsiz o‘qish (ba’zan string bo‘lmay qolishi mumkin)
    const rawTitle = req.body?.title;
    const rawTopicId = req.body?.topicId;

    const title =
      typeof rawTitle === "string" ? rawTitle.trim() : "";

    const topicId =
      typeof rawTopicId === "string" ? rawTopicId.trim() : "";

    if (!title) {
      return res.status(400).json({
        message: "title majburiy",
        debug: { body: req.body, hasFile: Boolean(req.file) },
      });
    }

    if (!topicId) {
      return res.status(400).json({
        message: "topicId majburiy",
        debug: { body: req.body, hasFile: Boolean(req.file) },
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Video fayl topilmadi" });
    }

    // ✅ topic dan subject + grade ni olamiz
    const topic = await CurriculumTopic.findById(topicId).select("_id subject grade");
    if (!topic) {
      return res.status(404).json({ message: "Topic topilmadi" });
    }

    const fileUrl = `/uploads/input/${req.file.filename}`;
    const fileName = req.file.originalname || req.file.filename || "video";
    const hasQueue = Boolean(videoQueue);

    // ✅ VideoLesson yaratamiz
    const video = await VideoLesson.create({
      title,
      topic: topic._id,
      teacher: req.user._id,
      subject: topic.subject,
      grade: topic.grade,
      status: hasQueue ? "uploaded" : "ready",
      fileUrl,
      fileName,
    });

    // ✅ queue bo‘lsa transcode job qo‘shamiz
    if (hasQueue) {
      await videoQueue.add("transcode", {
        videoId: video._id.toString(),
        filePath: req.file.path,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });
    }

    return res.status(201).json({
      message: hasQueue ? "Video yuklandi. Processing boshlandi" : "Video yuklandi",
      videoId: video._id,
      queued: hasQueue,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      message: "Upload error",
      error: err.message,
    });
  }
};
