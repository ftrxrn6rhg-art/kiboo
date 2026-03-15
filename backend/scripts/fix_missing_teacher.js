require("dotenv").config();
const mongoose = require("mongoose");
const VideoLesson = require("../models/VideoLesson");

async function main() {
  const TEACHER_ID = process.env.TEACHER_ID || "694b04e6ec0d154c7b00071b"; // Math Teacher ID

  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI topilmadi (.env ni tekshir)");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const filter = { $or: [{ teacher: { $exists: false } }, { teacher: null }] };

  const totalBefore = await VideoLesson.countDocuments();
  const noTeacherBefore = await VideoLesson.countDocuments(filter);

  console.log("Before:", { total: totalBefore, noTeacher: noTeacherBefore });

  const res = await VideoLesson.updateMany(filter, { $set: { teacher: TEACHER_ID } });

  console.log("Update result:", {
    matched: res.matchedCount ?? null,
    modified: res.modifiedCount ?? null,
  });

  const totalAfter = await VideoLesson.countDocuments();
  const noTeacherAfter = await VideoLesson.countDocuments(filter);

  console.log("After:", { total: totalAfter, noTeacher: noTeacherAfter });

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((e) => {
  console.error("❌ Error:", e.message || e);
  process.exit(1);
});
