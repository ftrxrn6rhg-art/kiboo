// backend/models/CurriculumTopic.js
const mongoose = require("mongoose");

const curriculumTopicSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    grade: { type: Number, required: true, index: true }, // 5..11

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurriculumChapter",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },

    order: { type: Number, default: 0 }, // mavzu tartibi (chapter ichida)

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

curriculumTopicSchema.index({ subject: 1, grade: 1, chapter: 1, order: 1 });

module.exports = mongoose.model("CurriculumTopic", curriculumTopicSchema);