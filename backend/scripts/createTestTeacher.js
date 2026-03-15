/**
 * scripts/createTestTeacher.js
 * Maqsad: test teacher yaratish (yoki topish) va JWT token chiqarish
 *
 * Run:
 *   node scripts/createTestTeacher.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function main() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!MONGO_URI) {
    console.log("❌ MONGO_URI topilmadi (.env ni tekshir)");
    process.exit(1);
  }

  if (!JWT_SECRET) {
    console.log("❌ JWT_SECRET topilmadi (.env ni tekshir)");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const email = "teacher@test.com";
  const password = "123456";

  let teacher = await User.findOne({ email });

  if (!teacher) {
    teacher = await User.create({
      name: "Math Teacher",
      email,
      password,
      role: "teacher",
    });
    console.log("✅ Teacher yaratildi:", teacher.email);
  } else {
    // agar bor bo‘lsa role teacher ekanini kafolatlaymiz
    if (teacher.role !== "teacher") {
      teacher.role = "teacher";
      await teacher.save();
      console.log("✅ Teacher role yangilandi:", teacher.email);
    } else {
      console.log("ℹ️ Teacher bor:", teacher.email);
    }
  }

  const token = jwt.sign(
    { id: teacher._id, role: teacher.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  console.log("\n================ TEACHER TOKEN ================\n");
  console.log(token);
  console.log("\n================================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Script error:", e.message);
  process.exit(1);
});
