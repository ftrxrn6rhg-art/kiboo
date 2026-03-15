// backend/models/ParentLink.js
const mongoose = require("mongoose");

const ParentLinkSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

ParentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("ParentLink", ParentLinkSchema);