// backend/controllers/progress/videoProgress.controller.js
const mongoose = require("mongoose");
const VideoProgress = require("../../models/VideoProgress");
const VideoLesson = require("../../models/VideoLesson");
const Subscription = require("../../models/Subscription");
const StudentProgress = require("../../models/StudentProgress");

exports.getOne = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "videoId noto‘g‘ri" });
    }

    const item = await VideoProgress.findOne({ user: userId, video: videoId })
      .populate("video", "title topic subject grade status hlsUrl")
      .lean();

    return res.json({ progress: item || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.upsertPosition = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;
    const { lastPositionSec } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "videoId noto‘g‘ri" });
    }

    const video = await VideoLesson.findById(videoId).select("_id");
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const pos = Number(lastPositionSec || 0);
    const nextStatus = pos > 0 ? "watching" : "started";

    const doc = await VideoProgress.findOneAndUpdate(
      { user: userId, video: videoId },
      {
        $set: {
          lastPositionSec: pos,
          status: nextStatus,
        },
        $setOnInsert: { startedAt: new Date() },
      },
      { new: true, upsert: true }
    );

    return res.json({ message: "Progress saqlandi ✅", progress: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.markCompleted = async (req, res) => {
  try {
    const userId = req.user._id;
    const { videoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "videoId noto‘g‘ri" });
    }

    const video = await VideoLesson.findById(videoId).select("_id");
    if (!video) return res.status(404).json({ message: "Video topilmadi" });

    const doc = await VideoProgress.findOneAndUpdate(
      { user: userId, video: videoId },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
        },
        $setOnInsert: { startedAt: new Date() },
      },
      { new: true, upsert: true }
    );

    // ✅ StudentProgress: videoCompletedTopics ni belgilash
    try {
      const sub = await Subscription.findOne({ student: userId, status: "active" })
        .select("subject")
        .lean();

      if (sub?.subject) {
        const v = await VideoLesson.findById(videoId).select("topic subject").lean();
        const topicId = v?.topic;

        if (topicId) {
          // 1) videoCompletedTopics ga qo‘shamiz
          await StudentProgress.updateOne(
            { student: userId, subject: sub.subject },
            {
            $addToSet: { videoCompletedTopics: topicId },
            $set: { lastSeenAt: new Date() }
          }
          );

          // 2) Agar test ham o‘tilgan bo‘lsa -> FULL completedTopics
          const sp = await StudentProgress.findOne({ student: userId, subject: sub.subject })
            .select("testCompletedTopics")
            .lean();

          const tc = (sp?.testCompletedTopics || []).map(String);
          if (tc.includes(String(topicId))) {
            await StudentProgress.updateOne(
              { student: userId, subject: sub.subject },
              {
                $addToSet: { completedTopics: topicId }
              }
            );
          }
        }
      }
    } catch (e) {
      // progress update xato bo‘lsa ham video complete response qaytaveradi
      console.error("StudentProgress update error:", e?.message || e);
    }

    return res.json({ message: "Video completed ✅", progress: doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.myProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const items = await VideoProgress.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(200)
      .populate("video", "title topic subject grade status hlsUrl");

    return res.json({ count: items.length, progress: items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};