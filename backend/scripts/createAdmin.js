/**
 * scripts/createAdmin.js
 * Maqsad: admin yaratish (yoki topish) va JWT token chiqarish
 *
 * Run:
 *   node scripts/createAdmin.js
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

  const email = process.env.ADMIN_EMAIL || "admin@test.com";
  const password = process.env.ADMIN_PASSWORD || "123456";

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = await User.create({
      name: "KIBOO Admin",
      email,
      password,
      role: "admin",
      emailVerified: true,
    });
    console.log("✅ Admin yaratildi:", admin.email);
  } else {
    let changed = false;
    if (admin.role !== "admin") {
      admin.role = "admin";
      changed = true;
    }
    if (admin.emailVerified === false) {
      admin.emailVerified = true;
      changed = true;
    }
    if (changed) {
      await admin.save();
      console.log("✅ Admin yangilandi:", admin.email);
    } else {
      console.log("ℹ️ Admin bor:", admin.email);
    }
  }

  const token = jwt.sign(
    { id: admin._id, role: admin.role },
    JWT_SECRET,
    { expiresIn: "30d" }
  );

  console.log("\n================ ADMIN TOKEN ================\n");
  console.log(token);
  console.log("\n================================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Script error:", e.message);
  process.exit(1);
});
