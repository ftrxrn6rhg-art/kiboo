// backend/models/CurriculumChapter.js
const mongoose = require("mongoose");

const curriculumChapterSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    grade: { type: Number, required: true, index: true }, // 5..11
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }, // bob tartibi
  },
  { timestamps: true }
);

curriculumChapterSchema.index({ subject: 1, grade: 1, order: 1 });

module.exports = mongoose.model("CurriculumChapter", curriculumChapterSchema);