// backend/models/VideoLesson.js
const mongoose = require("mongoose");

const videoLessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // ✅ ASOSIY: Video kimniki (teacher)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // course endi majburiy EMAS (keyin maxsus kurslar uchun ishlatamiz)
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },

    // ASOSIY: Topic
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurriculumTopic",
      required: true,
      index: true,
    },

    // tez query uchun (denormalizatsiya)
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    grade: {
      type: Number,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "ready", "failed"],
      default: "uploaded",
    },

    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    hlsUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    thumbnailUrl: { type: String, default: "" },

    // Like/Dislike
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("VideoLesson", videoLessonSchema);
