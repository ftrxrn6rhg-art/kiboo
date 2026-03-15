// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "teacher", "student", "parent"],
      default: "student",
    },

    // ✅ Student (va boshqalar) uchun avatar link
    // Masalan: "/uploads/avatars/694c2582.../avatar.jpg"
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ixtiyoriy: sinf (keyin ishlatamiz)
    grade: {
      type: Number,
      default: null,
      index: true,
    },

    // Profil qo‘shimchalari
    goal: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
    achievements: { type: String, default: "", trim: true },

    // ✅ Parent-child bog‘lash uchun kod (faqat studentlar uchun)
    parentCode: { type: String, unique: true, sparse: true, index: true, trim: true },

    // ✅ Teacher approval
    teacherApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    teacherApprovedAt: { type: Date, default: null },
    teacherApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // ✅ Teacher certificates
    certificates: [
      {
        url: { type: String, default: "" },
        name: { type: String, default: "" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    emailVerificationTokenHash: { type: String, default: "", select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },

    // ✅ Password reset
    resetPasswordTokenHash: { type: String, default: "", select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

// ✅ Password hash (faqat password o‘zgarganda)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ✅ Login uchun password compare
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
