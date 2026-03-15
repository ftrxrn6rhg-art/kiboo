const mongoose = require("mongoose");

const studentProgressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // progress qaysi subject bo‘yicha yuradi (subscriptiondagi subject)
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    // grade/level: Matematika/Fizika => 5..11, Ingliz tili => level (1..N)
    currentGradeOrLevel: {
      type: Number,
      required: true,
      default: 5,
      index: true,
    },

    // ayni grade/level ichida qaysi topicga kelgan (CurriculumTopic)
    currentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurriculumTopic",
      default: null,
      index: true,
    },

    // ✅ VIDEO progress: qaysi topic videolari "yetarlicha ko‘rildi"
    videoCompletedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CurriculumTopic",
      },
    ],

    // ✅ TEST progress: qaysi topic testlari "passing"
    testCompletedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CurriculumTopic",
      },
    ],

    // ✅ FULL completion: video + test ikkalasi ham bo‘lsa
    completedTopics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CurriculumTopic",
      },
    ],

    // statistika (keyin parent panelga ham kerak bo‘ladi)
    totalWatchSeconds: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 1 student + 1 subject => bitta progress hujjat
studentProgressSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("StudentProgress", studentProgressSchema);