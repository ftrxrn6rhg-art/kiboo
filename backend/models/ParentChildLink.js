// backend/models/ParentChildLink.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ parent: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("ParentChildLink", schema);