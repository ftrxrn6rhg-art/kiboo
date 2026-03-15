// backend/models/VideoProgress.js
const mongoose = require("mongoose");

const videoProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoLesson",
      required: true,
      index: true,
    },

    // ko‘rish holati
    status: {
      type: String,
      enum: ["started", "watching", "completed"],
      default: "started",
      index: true,
    },

    // video ichida qayergacha ko‘rdi (sekund)
    lastPositionSec: { type: Number, default: 0 },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 1 user + 1 video = bitta progress bo‘lsin
videoProgressSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model("VideoProgress", videoProgressSchema);