const mongoose = require("mongoose");

const AssignmentAttemptSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["started", "submitted"],
      default: "started",
      index: true,
    },

    // Student tanlagan javoblar: [{questionId, selectedIndex}]
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AssignmentQuestion",
          required: true,
        },
        selectedIndex: {
          type: Number,
          default: -1,
        },
      },
    ],

    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },

    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    scorePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentAttempt", AssignmentAttemptSchema);
