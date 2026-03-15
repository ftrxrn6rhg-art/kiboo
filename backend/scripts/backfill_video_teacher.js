/**
 * Backfill: VideoLesson documents that don't have `teacher` field.
 * Sets teacher = TEACHER_ID (env) or default hardcoded teacherId.
 *
 * Run:
 *   node scripts/backfill_video_teacher.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const VideoLesson = require("../models/VideoLesson");

const DEFAULT_TEACHER_ID = "694b04e6ec0d154c7b00071b"; // Math Teacher

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI topilmadi (.env tekshir)");
    process.exit(1);
  }

  const teacherId = process.env.TEACHER_ID || DEFAULT_TEACHER_ID;

  await mongoose.connect(MONGO_URI);
  console.log("✅ Mongo connected");

  const filter = { $or: [{ teacher: { $exists: false } }, { teacher: null }] };

  const total = await VideoLesson.countDocuments();
  const noTeacher = await VideoLesson.countDocuments(filter);

  console.log("Before:", { total, noTeacher, teacherId });

  if (noTeacher === 0) {
    console.log("✅ Hech narsa o'zgartirish shart emas (hammasida teacher bor).");
    await mongoose.disconnect();
    return;
  }

  const res = await VideoLesson.updateMany(filter, { $set: { teacher: teacherId } });

  // mongoose 7+: res.modifiedCount / res.matchedCount
  console.log("Update result:", {
    matched: res.matchedCount ?? res.n ?? null,
    modified: res.modifiedCount ?? res.nModified ?? null,
  });

  const noTeacherAfter = await VideoLesson.countDocuments(filter);
  console.log("After:", { total: await VideoLesson.countDocuments(), noTeacher: noTeacherAfter });

  await mongoose.disconnect();
  console.log("✅ Done");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
