/**
 * scripts/createTestStudent.js
 * Maqsad: test student yaratish (yoki topish) va JWT token chiqarish
 *
 * Run:
 *   node scripts/createTestStudent.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

async function main() {
  const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!MONGO_URI) {
    console.log("❌ MONGO_URI topilmadi");
    process.exit(1);
  }
  if (!JWT_SECRET) {
    console.log("❌ JWT_SECRET topilmadi");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const email = "student@test.com";
  const password = "123456";

  let student = await User.findOne({ email });

  if (!student) {
    student = await User.create({
      name: "Test Student",
      email,
      password,
      role: "student",
    });
    console.log("✅ Student yaratildi:", student.email);
  } else {
    if (student.role !== "student") {
      student.role = "student";
      await student.save();
      console.log("✅ Student role yangilandi:", student.email);
    } else {
      console.log("ℹ️ Student bor:", student.email);
    }
  }

  const token = jwt.sign(
    { id: student._id, role: student.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  console.log("\n================ STUDENT TOKEN ================\n");
  console.log(token);
  console.log("\n================================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Script error:", e.message);
  process.exit(1);
});