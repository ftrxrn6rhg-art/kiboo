const mongoose = require("mongoose");

const AssignmentQuestionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      index: true,
    },

    order: {
      type: Number,
      default: 1,
      min: 1,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Variantlar (MCQ)
    options: {
      type: [String],
      default: [],
    },

    // To'g'ri javob indexi (0,1,2,3...)
    correctIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Izoh (studentga keyin ko'rsatish mumkin)
    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignmentQuestion", AssignmentQuestionSchema);
