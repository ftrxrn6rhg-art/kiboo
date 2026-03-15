const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    duration: {
      type: Number,
      required: true
    },

    order: {
      type: Number,
      required: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);