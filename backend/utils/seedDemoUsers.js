// backend/utils/seedDemoUsers.js
const crypto = require("crypto");
const User = require("../models/User");

function makeParentCode() {
  return `KIBOO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function ensureUser({ email, name, role }) {
  let user = await User.findOne({ email });
  let changed = false;

  if (!user) {
    user = await User.create({
      name,
      email,
      password: "123456",
      role,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      parentCode: role === "student" ? makeParentCode() : undefined,
    });
    return { created: true, user };
  }

  if (user.role !== role) {
    user.role = role;
    changed = true;
  }
  if (!user.emailVerified) {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    changed = true;
  }
  if (role === "student" && !user.parentCode) {
    user.parentCode = makeParentCode();
    changed = true;
  }

  // Demo login uchun parolni bir xil qilamiz
  user.password = "123456";
  changed = true;

  if (changed) await user.save();
  return { created: false, updated: true, user };
}

module.exports = async function seedDemoUsers() {
  if (String(process.env.SEED_DEMO_USERS || "true").toLowerCase() === "false") return;
  await ensureUser({ email: "student@test.com", name: "Test Student", role: "student" });
  await ensureUser({ email: "teacher@test.com", name: "Test Teacher", role: "teacher" });
  await ensureUser({ email: "parent@test.com", name: "Test Parent", role: "parent" });
};
