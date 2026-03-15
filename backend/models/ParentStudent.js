// backend/models/ParentStudent.js
const mongoose = require("mongoose");

const parentStudentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 1 parent + 1 student bir marta bog‘lanadi
parentStudentSchema.index({ parent: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ParentStudent", parentStudentSchema);