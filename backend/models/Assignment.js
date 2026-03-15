const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    // Kim yaratdi (teacher)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Qaysi fan (Matematika, Ingliz, Fizika...)
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    // Qaysi sinf (5-11)
    grade: {
      type: Number,
      required: true,
      min: 1,
      max: 11,
    },

    // Qaysi mavzu (CurriculumTopic)
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CurriculumTopic",
      required: true,
    },

    // Qaysi video bilan bog'langan (VideoLesson)
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoLesson",
      default: null,
    },

    // Topshiriq nomi
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // Izoh / instruktsiya
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // Topshiriq fayli (ixtiyoriy)
    fileUrl: { type: String, default: "", trim: true },
    fileName: { type: String, default: "", trim: true },

    // Topshiriq turi
    // quiz = test, written = yozma, audio = audio topshiriq, file = fayl yuklash
    type: {
      type: String,
      enum: ["quiz", "written", "audio", "file"],
      default: "quiz",
    },

    // Status (teacher draft qilib turadi, keyin publish qiladi)
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    // Studentlar uchun ko‘rinish vaqti (ixtiyoriy)
    publishAt: {
      type: Date,
      default: null,
    },

    // deadline (ixtiyoriy)
    deadline: {
      type: Date,
      default: null,
    },

    // Like/Dislike
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
