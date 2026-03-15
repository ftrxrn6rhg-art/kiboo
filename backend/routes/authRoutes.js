const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect, roleCheck } = require("../middlewares/authMiddleware");

// auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// protected
router.get("/me", protect, me);

// admin-only route
router.get(
  "/admin",
  protect,
  roleCheck("admin"),
  (req, res) => {
    res.json({
      message: "Admin route ishladi ✅",
      user: req.user,
    });
  }
);

module.exports = router;
