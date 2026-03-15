// backend/models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Matematika, Ingliz tili takror bo‘lmasin
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true, // matematika, english kabi
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);